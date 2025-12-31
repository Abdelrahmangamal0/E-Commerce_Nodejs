// import { DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, DeleteObjectsCommandOutput, GetObjectCommand, GetObjectCommandOutput, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
// import { storageEnum } from './cloud.multer'
// import {v4 as uuid} from 'uuid'
// import { createReadStream } from 'fs'
// import { BadRequestException } from '../response/error.response'
// import { Upload } from '@aws-sdk/lib-storage'
// import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import {DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, DeleteObjectsCommandOutput, GetObjectCommand, GetObjectCommandOutput, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client} from '@aws-sdk/client-s3'
import { storageEnum } from '../enums'
import { BadRequestException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { createReadStream } from 'fs'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export class S3Service {
    constructor(
        private s3Client: S3Client
    ) {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION as string,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID as string
            }
        })
    }





    uploadFile = async ({
        storageApproach = storageEnum.memory,
        Bucket = process.env.AWS_BUCKET_NAME,
        ACL = "private",
        path = "general",
        file
    }: {
        storageApproach?: storageEnum,
        Bucket?: string,
        ACL?: ObjectCannedACL,
        path?: string,
        file: Express.Multer.File
    }) => {
        const command = new PutObjectCommand({
            Bucket,
            ACL,
            Key: `${process.env.APP_NAME}/${path}/${randomUUID()}_${file.originalname}`,
            Body: storageApproach === storageEnum.memory ? file.buffer : createReadStream(file.path),
            ContentType: file.mimetype
        })




      await this.s3Client.send(command)
        if (!command?.input?.Key) {
            throw new BadRequestException('fail to generate upload key')
        }
   
        return command.input.Key

    }


    uploadFiles = async ({
        storageApproach = storageEnum.memory,
        Bucket = process.env.AWS_BUCKET_NAME as string,
        ACL = "private",
        path = "general",
        files
    }: {
        storageApproach?: storageEnum,
        Bucket?: string,
        ACL?: ObjectCannedACL,
        path?: string,
        files: Express.Multer.File[]
    }):Promise<string[]> => {
        let urls:string[]=[]
        for (const file of files) {
    
   
            const key = await this.uploadFile({
                file,
                path,
                ACL,
                Bucket,
                storageApproach,

            });
            urls.push(key)

        }
    return urls
    }








    uploadLargeFile = async ({
        storageApproach = storageEnum.memory,
        Bucket = process.env.AWS_BUCKET_NAME,
        ACL = "private",
        path = "general",
        file
    }: {
        storageApproach?: storageEnum,
        Bucket?: string,
        ACL?: ObjectCannedACL,
        path?: string,
        file: Express.Multer.File
    }) => {
        const upload = new Upload({
        
            client:  this.s3Client,
        
            params: {
                Bucket,
                ACL,
                Key: `${process.env.APP_NAME}/${path}/${randomUUID()}_${file.originalname
                    }`,
                Body: storageApproach === storageEnum.memory ? file.buffer : createReadStream(file.path),
                ContentType: file.mimetype
            },
            partSize:2*1024*1024
        })

        upload.on('httpUploadProgress', (progress) => {
          console.log("upload file progress :::" , progress);
      
      })

        let {Key} = await upload.done()
    
        if (!Key) {
            throw new BadRequestException('fail to generate upload key')
        }
    
        return Key
  

    }



    createPreSignUploadLink = async({
        Bucket = process.env.AWS_BUCKET_NAME,
        path = "general",
        expiresIn=Number(process.env.AWS_S3_EXPIRE_IN),
        ContentType,
        originalName
    }: {
        Bucket?: string,
        path?: string,
        expiresIn?: number,
        ContentType: string,
        originalName:string
        }):Promise<{url:string , Key:string}> => {
    
        const commend = new PutObjectCommand({
            Bucket,
            Key: `${process.env.APP_NAME}/${path}/${randomUUID()}_pre_${originalName}`,
            ContentType
        })
        const url = await getSignedUrl( this.s3Client, commend, { expiresIn });
        if (!url || !commend?.input?.Key) {
            throw new BadRequestException('Fail to create pre signed url')
        }
        return {url , Key : commend.input.Key}
    }
    createGetPreSignUploadLink = async({
        Bucket = process.env.AWS_BUCKET_NAME,
        Key,
        expiresIn = Number(process.env.AWS_S3_EXPIRE_IN),
        filename='dummy',
        download='false'
    
    }: {
        Bucket?: string,
        Key:string,
        expiresIn?: number,
        filename?:string,
        download?:string
        }):Promise<string> => {
    
        const commend = new GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download === 'true' ? `attachment;filename="${filename || Key.split('/').pop()}"`
                :undefined,
  
        })
        const url = await getSignedUrl( this.s3Client, commend, { expiresIn });
        if (!url ) {
            throw new BadRequestException('Fail to create pre signed url')
        }
        return url
    }



    getFile = async ({
    
        Bucket = process.env.AWS_BUCKET_NAME as string,
        Key
    }: {
            Bucket?: string,
            Key: string
   
    }):Promise<GetObjectCommandOutput> => {
        const commend = new  GetObjectCommand({
            Bucket,
            Key
      
        })

        return  await this.s3Client.send(commend)
    }



    deleteFile = async ({
    
        Bucket = process.env.AWS_BUCKET_NAME as string,
        Key
   
    }: {
        Bucket?: string,
        Key: string,
   
    }):Promise<DeleteObjectCommandOutput> => {
        const commend = new DeleteObjectCommand(
            {
                Bucket,
                Key
            }
        )

        return await this.s3Client.send(commend)


    }

    deleteFiles = async({
        Bucket = process.env.AWS_BUCKET_NAME as string,
        urls,
        Quiet=false
    }: {
        Bucket?: string,
        urls: string[],
        Quiet?:boolean
     
    }
    ):Promise<DeleteObjectsCommandOutput> => {
        const Objects = urls.map((url) => {
            return {Key:url}
        })
        const command = new DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects,
                Quiet
            }

        
        })
        return await this.s3Client.send(command)
    }


    listDirectoryFile = async({
        Bucket= process.env.AWS_BUCKET_NAME as string,
        path
    }: {
        Bucket?:string,
        path:string
        }) => {
    
        const command = new ListObjectsV2Command({
            Bucket,
            Prefix:`${process.env.APP_NAME}/${path}`
        })

        return await this.s3Client.send(command)
    }
    deleteFilesByPrefix = async({
        Bucket= process.env.AWS_BUCKET_NAME as string,
        path,
        Quiet=false
    }: {
        Bucket?:string,
        path: string,
        Quiet?:boolean
        }) => {
    
            const Files = await this.listDirectoryFile({Bucket, path })
            if (!Files?.Contents?.length) {
                throw new BadRequestException('empty Directory')
            }
            const urls = Files.Contents.map((file) => {
                return file.Key
            }) as string[]
           return await this.deleteFiles({urls , Bucket ,Quiet})
   
    }
}