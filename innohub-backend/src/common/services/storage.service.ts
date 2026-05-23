import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class StorageService implements OnModuleInit {
  private bucket: any;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        storageBucket: this.configService.get<string>('FIREBASE_STORAGE_BUCKET'),
      });
    }
    this.bucket = admin.storage().bucket();
  }

  async getSignedUrl(filePath: string, expiresMinutes = 15): Promise<string> {
    const [url] = await this.bucket.file(filePath).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresMinutes * 60 * 1000,
    });
    return url;
  }
}
