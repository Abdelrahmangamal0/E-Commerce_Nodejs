// import { DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, DeleteObjectsCommandOutput, GetObjectCommand, GetObjectCommandOutput, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
// import { storageEnum } from './cloud.multer'
// import {v4 as uuid} from 'uuid'
// import { createReadStream } from 'fs'
// import { BadRequestException } from '../response/error.response'
// import { Upload } from '@aws-sdk/lib-storage'
// import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { storageEnum } from '../enums';
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config'; // تعليق: استخدام ConfigService لإدارة إعدادات S3 مركزياً

@Injectable() // تعليق: جعل الخدمة قابلة للحقن داخل Nest واستخدامها في أكثر من موديول
export class S3Service {
  constructor(
    private s3Client: S3Client,
    private readonly configService: ConfigService, // تعليق: حقن ConfigService للوصول لمتغيرات البيئة
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') as string, // تعليق: قراءة region من ملف البيئة
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') as string, // تعليق: مفتاح الوصول لحساب AWS
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ) as string,       },
    });
  }





  uploadFile = async ({
    storageApproach = storageEnum.memory,
    Bucket = this.configService.get<string>('AWS_BUCKET_NAME'),
    ACL = 'private',
    path = 'general',
    file,
  }: {
    storageApproach?: storageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    file: Express.Multer.File;
  }) => {
    const appName =
      this.configService.get<string>('APP_NAME') || 'app'; // تعليق: استخدام APP_NAME من الإعدادات مع قيمة افتراضية

    const command = new PutObjectCommand({
      Bucket,
      ACL,
      Key: `${appName}/${path}/${randomUUID()}_${file.originalname}`,
      Body:
        storageApproach === storageEnum.memory
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    if (!command?.input?.Key) {
      throw new BadRequestException('fail to generate upload key');
    }

    return command.input.Key;
  };


  uploadFiles = async ({
    storageApproach = storageEnum.memory,
    Bucket = this.configService.get<string>('AWS_BUCKET_NAME') as string,
    ACL = 'private',
    path = 'general',
    files,
  }: {
    storageApproach?: storageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    files: Express.Multer.File[];
  }): Promise<string[]> => {
    const uploads = files.map((file) =>
      this.uploadFile({
        file,
        path,
        ACL,
        Bucket,
        storageApproach,
      }),
    );
    const urls = await Promise.all(uploads);
    return urls;
  };








  uploadLargeFile = async ({
    storageApproach = storageEnum.memory,
    Bucket = this.configService.get<string>('AWS_BUCKET_NAME'),
    ACL = 'private',
    path = 'general',
    file,
  }: {
    storageApproach?: storageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    file: Express.Multer.File;
  }) => {
    const appName =
      this.configService.get<string>('APP_NAME') || 'app'; // تعليق: إعادة استخدام APP_NAME لتجميع الملفات تحت مسار ثابت

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket,
        ACL,
        Key: `${appName}/${path}/${randomUUID()}_${file.originalname}`,
        Body:
          storageApproach === storageEnum.memory
            ? file.buffer
            : createReadStream(file.path),
        ContentType: file.mimetype,
      },
      partSize: 2 * 1024 * 1024,
    });

    const { Key } = await upload.done();

    if (!Key) {
      throw new BadRequestException('fail to generate upload key');
    }

    return Key;
  };



  createPreSignUploadLink = async ({
    Bucket = this.configService.get<string>('AWS_BUCKET_NAME'),
    path = 'general',
    expiresIn = Number(
      this.configService.get<string>('AWS_S3_EXPIRE_IN'),
    ), // تعليق: استخدام زمن انتهاء التوقيع من الإعدادات
    ContentType,
    originalName,
  }: {
    Bucket?: string;
    path?: string;
    expiresIn?: number;
    ContentType: string;
    originalName: string;
  }): Promise<{ url: string; Key: string }> => {
    const appName =
      this.configService.get<string>('APP_NAME') || 'app'; // تعليق: الحفاظ على بنية مفاتيح S3 موحدة باستخدام APP_NAME

    const commend = new PutObjectCommand({
      Bucket,
      Key: `${appName}/${path}/${randomUUID()}_pre_${originalName}`,
      ContentType,
    });
    const url = await getSignedUrl(this.s3Client, commend, { expiresIn });
    if (!url || !commend?.input?.Key) {
      throw new BadRequestException('Fail to create pre signed url');
    }
    return { url, Key: commend.input.Key };
  };

  createGetPreSignUploadLink = async ({
    Bucket = this.configService.get<string>('AWS_BUCKET_NAME'),
    Key,
    expiresIn = Number(
      this.configService.get<string>('AWS_S3_EXPIRE_IN'),
    ), // تعليق: توحيد زمن انتهاء روابط التحميل الموقّعة
    filename = 'dummy',
    download = 'false',
  }: {
    Bucket?: string;
    Key: string;
    expiresIn?: number;
    filename?: string;
    download?: string;
  }): Promise<string> => {
    const commend = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition:
        download === 'true'
          ? `attachment;filename="${
              filename || Key.split('/').pop()
            }"` // تعليق: السماح بتحميل الملف كـ attachment عند الحاجة
          : undefined,
    });
    const url = await getSignedUrl(this.s3Client, commend, { expiresIn });
    if (!url) {
      throw new BadRequestException('Fail to create pre signed url');
    }
    return url;
  };



  getFile = async ({
    Bucket = this.configService.get<string>('AWS_BUCKET_NAME') as string,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<GetObjectCommandOutput> => {
    const commend = new GetObjectCommand({
      Bucket,
      Key,
    });

    return await this.s3Client.send(commend);
  };



  deleteFile = async ({
    Bucket = this.configService.get<string>('AWS_BUCKET_NAME') as string,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<DeleteObjectCommandOutput> => {
    const commend = new DeleteObjectCommand({
      Bucket,
      Key,
    });

    return await this.s3Client.send(commend);
  };

  deleteFiles = async ({
    Bucket = this.configService.get<string>('AWS_BUCKET_NAME') as string,
    urls,
    Quiet = false,
  }: {
    Bucket?: string;
    urls: string[];
    Quiet?: boolean;
  }): Promise<DeleteObjectsCommandOutput> => {
    const Objects = urls.map((url) => {
      return { Key: url };
    });
    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects,
        Quiet,
      },
    });
    return await this.s3Client.send(command);
  };


  listDirectoryFile = async ({
    Bucket = this.configService.get<string>('AWS_BUCKET_NAME') as string,
    path,
  }: {
    Bucket?: string;
    path: string;
  }) => {
    const appName =
      this.configService.get<string>('APP_NAME') || 'app'; // تعليق: استخدام APP_NAME لبناء Prefix المجلد

    const command = new ListObjectsV2Command({
      Bucket,
      Prefix: `${appName}/${path}`,
    });

    return await this.s3Client.send(command);
  };

  deleteFilesByPrefix = async ({
    Bucket = this.configService.get<string>('AWS_BUCKET_NAME') as string,
    path,
    Quiet = false,
  }: {
    Bucket?: string;
    path: string;
    Quiet?: boolean;
  }) => {
    const Files = await this.listDirectoryFile({ Bucket, path });
    if (!Files?.Contents?.length) {
      throw new BadRequestException('empty Directory');
    }
    const urls = Files.Contents.map((file) => {
      return file.Key;
    }) as string[];
    return await this.deleteFiles({ urls, Bucket, Quiet });
  };
}