import {
  DeleteObjectCommand,
  PutObjectCommand,
  type S3Client,
} from '@aws-sdk/client-s3';
import { describe, expect, it, vi } from 'vitest';

import { S3AttachmentStorage } from '../src/services/attachment-storage.service.js';

describe('S3AttachmentStorage', () => {
  it('stores files with a private tenant-service key and server-side encryption', async () => {
    const commands: unknown[] = [];
    const send = vi.fn((command: unknown) => {
      commands.push(command);
      return Promise.resolve({});
    });
    const storage = new S3AttachmentStorage({
      bucket: 'portal-attachments',
      keyPrefix: '/production/attachments/',
      region: 'us-east-1',
      client: { send } as unknown as S3Client,
    });
    const data = Buffer.from('supporting context');

    const stored = await storage.store({
      originalName: ' Project Plan.PDF ',
      data,
      size: data.byteLength,
    });

    expect(stored.fileName).toBe(' Project Plan.PDF ');
    expect(stored.storageKey).toMatch(
      /^production\/attachments\/[0-9a-f-]+\.pdf$/,
    );
    expect(send).toHaveBeenCalledOnce();
    const command = commands[0];
    expect(command).toBeInstanceOf(PutObjectCommand);
    if (!(command instanceof PutObjectCommand)) {
      throw new Error('Expected an S3 PutObjectCommand.');
    }
    expect(command.input).toMatchObject({
      Bucket: 'portal-attachments',
      Key: stored.storageKey,
      Body: data,
      ContentLength: data.byteLength,
      ServerSideEncryption: 'AES256',
    });
  });

  it('removes an object when requirement persistence fails', async () => {
    const commands: unknown[] = [];
    const send = vi.fn((command: unknown) => {
      commands.push(command);
      return Promise.resolve({});
    });
    const storage = new S3AttachmentStorage({
      bucket: 'portal-attachments',
      keyPrefix: 'attachments',
      region: 'us-east-1',
      client: { send } as unknown as S3Client,
    });

    await storage.remove('attachments/file.pdf');

    const command = commands[0];
    expect(command).toBeInstanceOf(DeleteObjectCommand);
    if (!(command instanceof DeleteObjectCommand)) {
      throw new Error('Expected an S3 DeleteObjectCommand.');
    }
    expect(command.input).toEqual({
      Bucket: 'portal-attachments',
      Key: 'attachments/file.pdf',
    });
  });
});
