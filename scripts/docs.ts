import fs from 'fs';
import path from 'path';
import { runGenerator } from 'ts-docgen';

// Update docs/general/welcome.md to track README.md
const README = fs
  .readFileSync(path.join(__dirname, '../README.md'), { encoding: 'utf8' })
  .replace(/https:\/\/slash-create\.js\.org\/#([\w/]+)/, '#$1');
fs.writeFileSync(path.join(__dirname, '../docs/general/welcome.md'), README);

// Update docs/general/changelog.md to track CHANGELOG.md
const CHANGELOG = fs
  .readFileSync(path.join(__dirname, '../CHANGELOG.md'), { encoding: 'utf8' })
  .replace(/https:\/\/slash-create\.js\.org\/#([\w/]+)/, '#$1');
fs.writeFileSync(path.join(__dirname, '../docs/general/changelog.md'), CHANGELOG);

runGenerator({
  existingOutput: '.tmp/typedoc-out.json',
  custom: 'docs/index.yml',
  output: 'docs/docs.json'
});
