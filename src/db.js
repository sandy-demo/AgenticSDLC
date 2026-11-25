import Database from 'better-sqlite3';
import { categories, dateKey, shiftDay } from './services/validation.js';

const demoUsers = [
  [1, 'Employee 01', 'employee', 'Operasional'],
  [2, 'Employee 02', 'employee', 'Operasional'],
  [3, 'Employee 03', 'employee', 'Teknologi'],
  [4, 'Manager 01', 'manager', 'Operasional'],
  [5, 'Manager 02', 'manager', 'Teknologi'],
  [6, 'Finance 01', 'finance', 'Keuangan'],
];

export function createDatabase(now = new Date()) {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY, alias TEXT NOT NULL, role TEXT NOT NULL, department TEXT NOT NULL
    );
    CREATE TABLE claims (
      id INTEGER PRIMARY KEY, employee_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL, category TEXT NOT NULL, amount INTEGER NOT NULL,
      claim_date TEXT NOT NULL, attachment TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE TABLE claim_events (
      id INTEGER PRIMARY KEY, claim_id INTEGER NOT NULL REFERENCES claims(id),
      actor_id INTEGER NOT NULL REFERENCES users(id), at TEXT NOT NULL,
      from_status TEXT, to_status TEXT NOT NULL
    );
    CREATE TABLE approval_outcomes (
      actor_id INTEGER NOT NULL REFERENCES users(id),
      claim_id INTEGER NOT NULL REFERENCES claims(id),
      key TEXT NOT NULL, action TEXT NOT NULL, status TEXT NOT NULL,
      PRIMARY KEY (actor_id, claim_id, key)
    );
  `);
  const addUser = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?)');
  const addClaim = db.prepare(`
    INSERT INTO claims (employee_id, title, category, amount, claim_date, attachment, notes)
    VALUES (@employeeId, @title, @category, @amount, @claimDate, @attachment, @notes)
  `);
  const addEvent = db.prepare('INSERT INTO claim_events (claim_id, actor_id, at, from_status, to_status) VALUES (?, ?, ?, ?, ?)');
  const selectClaim = db.prepare(`
    SELECT c.id, c.employee_id AS employeeId, c.title, c.category, c.amount, c.claim_date AS claimDate,
           c.attachment, c.notes, c.status, u.department
    FROM claims c JOIN users u ON u.id = c.employee_id WHERE c.id = ?
  `);
  const listOwn = db.prepare(`
    SELECT id FROM claims WHERE employee_id = ? ORDER BY id DESC LIMIT 100
  `);
  const ownListItem = db.prepare(`
    SELECT id, employee_id AS employeeId, title, category, amount, claim_date AS claimDate, status
    FROM claims WHERE id = ? AND employee_id = ?
  `);
  const listForManager = db.prepare(`
    SELECT c.id, c.title, c.amount, c.category, c.status, u.alias AS employee
    FROM claims c JOIN users u ON u.id = c.employee_id WHERE u.department = ? AND c.status = 'pending'
    ORDER BY c.id DESC LIMIT 100
  `);
  const listForFinance = db.prepare(`
    SELECT c.id, c.title, c.amount, c.category, c.status, u.alias AS employee
    FROM claims c JOIN users u ON u.id = c.employee_id WHERE c.status = 'finance_review'
    ORDER BY c.id DESC LIMIT 100
  `);
  const getUser = db.prepare('SELECT id, alias, role, department FROM users WHERE id = ?');
  const updateStatus = db.prepare('UPDATE claims SET status = ? WHERE id = ? AND status = ?');
  const selectApprovalOutcome = db.prepare(`
    SELECT action, status FROM approval_outcomes WHERE actor_id = ? AND claim_id = ? AND key = ?
  `);
  const addApprovalOutcome = db.prepare(`
    INSERT INTO approval_outcomes (actor_id, claim_id, key, action, status) VALUES (?, ?, ?, ?, ?)
  `);
  const report = db.prepare(`
    SELECT c.category, u.department, COUNT(*) AS count, SUM(c.amount) AS total
    FROM claims c JOIN users u ON u.id = c.employee_id
    WHERE c.claim_date BETWEEN ? AND ? AND c.status = 'approved'
    GROUP BY c.category, u.department ORDER BY c.category, u.department
  `);
  const history = db.prepare(`
    SELECT actor_id AS actorId, at, from_status AS fromStatus, to_status AS toStatus
    FROM claim_events WHERE claim_id = ? ORDER BY id
  `);

  const insertClaim = db.transaction((employeeId, input, at) => {
    const id = Number(addClaim.run({ ...input, employeeId }).lastInsertRowid);
    addEvent.run(id, employeeId, at, null, 'pending');
    return selectClaim.get(id);
  });
  const transitionClaim = db.transaction((claim, actorId, status, at, outcome) => {
    if (updateStatus.run(status, claim.id, claim.status).changes !== 1) return null;
    addEvent.run(claim.id, actorId, at, claim.status, status);
    if (outcome) addApprovalOutcome.run(actorId, claim.id, outcome.key, outcome.action, status);
    return selectClaim.get(claim.id);
  });
  db.transaction(() => {
    for (const user of demoUsers) addUser.run(...user);
    for (let index = 0; index < 20; index += 1) {
      const { id } = insertClaim((index % 3) + 1, {
        title: ['Taksi bandara', 'Makan rapat', 'Perlengkapan kerja', 'Parkir kantor'][index % 4] + ` #${index + 1}`,
        category: categories[index % categories.length], amount: 125_000 * (index + 1),
        claimDate: dateKey(index < 12 ? now : shiftDay(now, -30)), attachment: '', notes: '',
      }, now.toISOString());
      if (index >= 9) {
        const manager = index % 3 === 2 ? 5 : 4;
        const pending = transitionClaim(selectClaim.get(id), manager, 'finance_review', now.toISOString());
        if (index >= 12) transitionClaim(pending, 6, 'approved', now.toISOString());
      }
    }
  })();

  return {
    close: () => db.close(),
    getUser: (id) => getUser.get(id),
    getClaim: (id) => selectClaim.get(id),
    listOwn: (userId) => listOwn.all(userId).map(({ id }) => ownListItem.get(id, userId)),
    approvalQueue: (user) => user.role === 'manager' ? listForManager.all(user.department) : listForFinance.all(),
    history: (id) => history.all(id),
    getApprovalOutcome: (actorId, claimId, key) => selectApprovalOutcome.get(actorId, claimId, key),
    insertClaim,
    transitionClaim,
    report: (month) => report.all(`${month}-01`, `${month}-31`),
  };
}
