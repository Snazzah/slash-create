import { runGenerator } from 'ts-docgen/src/index';

runGenerator({
  existingOutput: '.tmp/typedoc-out.json',
  custom: 'docs/index.yml',
  output: 'docs/docs.json'
});
