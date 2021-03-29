import { runGenerator } from 'ts-docgen';

runGenerator({
  existingOutput: '.tmp/typedoc-out.json',
  custom: 'docs/index.yml',
  output: 'docs/docs.json'
});
