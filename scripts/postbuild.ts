import fs from 'fs';
import { join } from 'path';

const filePath = join(__dirname, '../lib/node/creator.js');

fs.writeFileSync(
  filePath,
  fs.readFileSync(filePath, { encoding: 'utf-8' }).replace('require((0, node_url_1.pathToFileURL)(filePath))', '(await import((0, node_url_1.pathToFileURL)(filePath))).default')
);
