import fs from 'fs';

const kindNames: Record<number, string> = {
  1: 'Project',
  2: 'Module',
  4: 'Namespace',
  8: 'Enumeration',
  16: 'Enumeration member',
  32: 'Variable',
  64: 'Function',
  128: 'Class',
  256: 'Interface',
  512: 'Constructor',
  1024: 'Property',
  2048: 'Method',
  4096: 'Call signature',
  8192: 'Index signature',
  16384: 'Constructor signature',
  32768: 'Parameter',
  65536: 'Type literal',
  131072: 'Type parameter',
  262144: 'Accessor',
  524288: 'Get signature',
  1048576: 'Set signature',
  2097152: 'Type alias',
  4194304: 'Reference'
};

function displayText(parts: Array<{ text?: string }> = []) {
  return parts.map((part) => part.text || '').join('');
}

function normalizeReflection(value: any): void {
  if (!value || typeof value !== 'object') return;

  if (typeof value.kind === 'number' && !value.kindString) {
    value.kindString = kindNames[value.kind];
  }

  if (value.comment?.summary && !value.comment.shortText) {
    const blockTags = (value.comment.blockTags || []).map((tag: any) => ({
      tag: String(tag.tag || '').replace(/^@/, ''),
      text: displayText(tag.content)
    }));
    const modifierTags = Array.from(value.comment.modifierTags || [], (tag) => ({
      tag: String(tag).replace(/^@/, ''),
      text: ''
    }));

    value.comment.shortText = displayText(value.comment.summary);
    value.comment.text = value.comment.shortText;
    value.comment.tags = [...blockTags, ...modifierTags];
    value.comment.returns = blockTags.find((tag: any) => tag.tag === 'returns')?.text;
  }

  for (const child of Object.values(value)) normalizeReflection(child);
}

function findReflection(value: any, name: string, kind: number): any {
  if (!value || typeof value !== 'object') return;
  if (value.name === name && value.kind === kind) return value;

  for (const child of value.children || []) {
    const result = findReflection(child, name, kind);
    if (result) return result;
  }
}

function attachCreatorEvents(data: any) {
  const eventMap = findReflection(data, 'SlashCreatorEvents', 256);
  const creator = findReflection(data, 'BaseSlashCreator', 128);
  const events = eventMap?.children?.filter((child: any) => {
    const comments = [child.comment, ...(child.signatures || []).map((signature: any) => signature.comment)];
    return comments.some((comment) =>
      comment?.tags?.some(
        (tag: any) => tag.tag === 'event' || (tag.tag === 'group' && tag.text === 'Events')
      )
    );
  });

  if (!creator || !events?.length) {
    throw new Error('TypeDoc output must contain BaseSlashCreator and its event map.');
  }

  creator.children = [
    ...(creator.children || []),
    ...events.map((event: any) => ({
      ...JSON.parse(JSON.stringify(event)),
      kindString: 'Event'
    }))
  ];
}

export function normalizeTypedocJson(path: string) {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  normalizeReflection(data);
  attachCreatorEvents(data);
  fs.writeFileSync(path, JSON.stringify(data));
}
