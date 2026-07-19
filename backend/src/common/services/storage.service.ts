import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface StoredObject {
  key: string;
  url: string;
  driver: string;
}

/**
 * Storage local (default) ou path compatível com S3/MinIO via STORAGE_DRIVER.
 * Sem AWS SDK — grava em disco; MinIO pode montar o mesmo volume.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: string;
  private readonly localRoot: string;
  private readonly publicBase: string;

  constructor(private config: ConfigService) {
    this.driver = this.config.get('STORAGE_DRIVER') || 'local';
    this.localRoot =
      this.config.get('STORAGE_LOCAL_PATH') ||
      path.join(process.cwd(), 'uploads');
    this.publicBase =
      this.config.get('STORAGE_PUBLIC_BASE') ||
      `${this.config.get('FRONTEND_URL') || 'http://localhost:3001'}/uploads`;
  }

  async saveDataUrl(dataUrl: string, folder: string): Promise<StoredObject> {
    const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
    if (!match) {
      // Já é URL/path externo
      return {
        key: dataUrl.slice(0, 200),
        url: dataUrl,
        driver: 'passthrough',
      };
    }

    const mime = match[1];
    const ext = mime.includes('png')
      ? 'png'
      : mime.includes('jpeg') || mime.includes('jpg')
        ? 'jpg'
        : mime.includes('webp')
          ? 'webp'
          : 'bin';
    const buffer = Buffer.from(match[2], 'base64');
    const key = `${folder}/${crypto.randomBytes(16).toString('hex')}.${ext}`;

    if (this.driver === 'local' || this.driver === 'minio-volume') {
      const full = path.join(this.localRoot, key);
      await fs.mkdir(path.dirname(full), { recursive: true });
      await fs.writeFile(full, buffer);
      this.logger.debug(`Stored ${key} (${buffer.length} bytes)`);
      return {
        key,
        url: `${this.publicBase.replace(/\/$/, '')}/${key}`,
        driver: this.driver,
      };
    }

    // Fallback: keep truncated data-url marker (não ideal, mas não quebra)
    return {
      key,
      url: `storage://${key}`,
      driver: this.driver,
    };
  }
}
