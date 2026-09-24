import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { AttachmentStorage, UploadedFile } from '../domain/workspace.js';

function safeExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(extension) ? extension : '';
}

function safeDisplayName(fileName: string) {
  return Array.from(path.basename(fileName))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('');
}

export class LocalAttachmentStorage implements AttachmentStorage {
  constructor(private readonly directory: string) {}

  async store(file: UploadedFile) {
    await mkdir(this.directory, { recursive: true });
    const storageKey = `${randomUUID()}${safeExtension(file.originalName)}`;
    await writeFile(path.join(this.directory, storageKey), file.data, {
      flag: 'wx',
    });
    return {
      fileName: safeDisplayName(file.originalName),
      storageKey,
      size: file.size,
    };
  }

  async remove(storageKey: string) {
    await rm(path.join(this.directory, path.basename(storageKey)), {
      force: true,
    });
  }
}
