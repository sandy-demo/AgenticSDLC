export function log(level, event, fields = {}) {
  const record = JSON.stringify({ level, event, ...fields });
  (level === 'error' ? console.error : console.info)(record);
}
