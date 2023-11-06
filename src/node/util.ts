import nacl from 'tweetnacl';
import path from 'node:path';
import { readdir, lstat } from 'node:fs/promises';

/**
 * Validates a payload from Discord against its signature and key.
 *
 * @param rawBody The raw payload data
 * @param signature The signature from the `X-Signature-Ed25519` header
 * @param timestamp The timestamp from the `X-Signature-Timestamp` header
 * @param clientPublicKey The public key from the Discord developer dashboard
 * @returns Whether or not validation was successful
 */
export async function verifyKey(
  body: string,
  signature: string,
  timestamp: string,
  clientPublicKey: string
): Promise<boolean> {
  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(clientPublicKey, 'hex')
    );
  } catch {
    return false;
  }
}

export async function getFiles(folderPath: string) {
  const fileList = await readdir(folderPath);
  const files: string[] = [];
  for (const file of fileList) {
    const filePath = path.join(folderPath, file);
    const stat = await lstat(filePath);
    if (stat.isDirectory()) files.push(...(await getFiles(filePath)));
    else files.push(filePath);
  }
  return files;
}
