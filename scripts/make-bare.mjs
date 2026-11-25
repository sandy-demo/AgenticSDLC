import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { git, root } from './demo-runtime.mjs';

const output = join(root, '.workshop', 'expense-app-bare.zip');
mkdirSync(join(root, '.workshop'), { recursive: true });
const committed = git(['ls-tree', '-r', '--name-only', 'HEAD']).split('\n');
const included = committed.filter((path) =>
  !/^(?:AGENTS\.md$|\.github\/(?:agents\/|skills\/|hooks\/|copilot-instructions\.md$|aw\/))/.test(path) &&
  !/^\.github\/workflows\/(?!ci\.yml$)/.test(path));
git(['archive', '--format=zip', `--output=${output}`, 'HEAD', '--', ...included]);
console.log(`${output}\nEkspor lokal saja. Tidak membuat repo atau mengubah pengaturan GitHub.`);
