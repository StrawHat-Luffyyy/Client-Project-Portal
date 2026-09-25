import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import type { AttachmentStorage, UploadedFile } from '../domain/workspace.js';

function safeExtension(fileName: string) {
  const extension = path.extname(fileName.trim()).toLowerCase();
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

export interface S3AttachmentStorageOptions {
  bucket: string;
  keyPrefix: string;
  region: string;
  client?: S3Client;
}

export class S3AttachmentStorage implements AttachmentStorage {
  private readonly bucket: string;
  private readonly keyPrefix: string;
  private readonly client: S3Client;

  constructor(options: S3AttachmentStorageOptions) {
    this.bucket = options.bucket;
    this.keyPrefix = options.keyPrefix.replace(/^\/+|\/+$/g, '');
    this.client = options.client ?? new S3Client({ region: options.region });
  }

  async store(file: UploadedFile) {
    const storageKey = `${this.keyPrefix}/${randomUUID()}${safeExtension(file.originalName)}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: file.data,
        ContentLength: file.size,
        ServerSideEncryption: 'AES256',
      }),
    );
    return {
      fileName: safeDisplayName(file.originalName),
      storageKey,
      size: file.size,
    };
  }

  async remove(storageKey: string) {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }),
    );
  }
}

export interface AttachmentStorageConfig {
  mode: 'local' | 's3';
  uploadDirectory: string;
  awsRegion: string;
  s3Bucket?: string;
  s3KeyPrefix: string;
}

export function createAttachmentStorage(
  config: AttachmentStorageConfig,
): AttachmentStorage {
  if (config.mode === 's3') {
    const bucket = config.s3Bucket;
    if (!bucket) {
      throw new Error('S3_BUCKET is required when ATTACHMENT_STORAGE=s3.');
    }
    return new S3AttachmentStorage({
      bucket,
      keyPrefix: config.s3KeyPrefix,
      region: config.awsRegion,
    });
  }
  return new LocalAttachmentStorage(config.uploadDirectory);
}
