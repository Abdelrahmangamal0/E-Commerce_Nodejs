import multer, { FileFilterCallback } from 'multer'
import os from 'os'
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {IMulterFile} from '../../interface'
import { storageEnum } from 'src/common/enums';




export const cloudFileUpload = ({
    validation = [],
    storageApproach = storageEnum.memory,
    fileSize = 2
}: {
    validation?: string[];
    storageApproach?: storageEnum;
    fileSize?: number
    
}
): MulterOptions => {
   return { storage : storageApproach === storageEnum.memory ? multer.memoryStorage() : multer.diskStorage({
        destination: os.tmpdir(),
        filename: function (
            req: Request,
            file: Express.Multer.File,
            callback
        ) {
            callback(null, `${randomUUID()}_${file.originalname}`)
        }
    }),
    
         
    fileFilter(req: Request, file: IMulterFile, callback: Function) {
        // console.log(validation, validation.includes(file.mimetype), file.mimetype)
        if (validation.includes(file.mimetype)) {
            return callback(null, true)
        }
        callback(new BadRequestException('In-Valid File format'))
    },
    limits: {
        fileSize: fileSize * 1024 * 1024
    }}
}