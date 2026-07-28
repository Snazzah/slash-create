import { runGenerator } from 'ts-docgen/src/index';
import { normalizeTypedocJson } from './typedoc-compat';

normalizeTypedocJson('.tmp/typedoc-out.json');
runGenerator({
  existingOutput: '.tmp/typedoc-out.json',
  custom: 'docs/index.yml',
  output: 'docs/docs.json'
});
