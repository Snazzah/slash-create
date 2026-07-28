import fs from 'fs';

const docs = JSON.parse(fs.readFileSync('docs/docs.json', 'utf8'));

if (!docs.classes?.length || !docs.typedefs?.length) {
  throw new Error('Generated documentation must contain API classes and typedefs.');
}

const baseSlashCreator = docs.classes.find((item: any) => item.name === 'BaseSlashCreator');
const eventNames = new Set(baseSlashCreator?.events?.map((event: any) => event.name));
const expectedEvents = [
  'ping',
  'synced',
  'rawREST',
  'warn',
  'debug',
  'error',
  'unverifiedRequest',
  'unknownInteraction',
  'rawInteraction',
  'rawRequest',
  'modalInteraction',
  'commandInteraction',
  'componentInteraction',
  'autocompleteInteraction',
  'commandRegister',
  'commandUnregister',
  'commandReregister',
  'commandBlock',
  'commandError',
  'commandRun'
];

if (expectedEvents.some((event) => !eventNames.has(event))) {
  throw new Error('Generated BaseSlashCreator documentation must contain every public event.');
}

const commandInteraction = baseSlashCreator.events.find((event: any) => event.name === 'commandInteraction');
if (commandInteraction.params?.map((param: any) => param.name).join(',') !== 'interaction,respond,webserverMode') {
  throw new Error('Generated event documentation must preserve event parameters.');
}
