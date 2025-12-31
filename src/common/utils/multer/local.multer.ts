import { randomUUID } from "crypto"
import { diskStorage } from "multer"
import {Request} from 'express'
import path from "path"
import { existsSync, mkdirSync } from "fs"

import {IMulterFile} from '../../interface'
import { BadRequestException } from "@nestjs/common"
export const localFileUpload = ({Folder='public' , validation=[]}:{Folder?:string , validation:string[]}) => {
    let bathePath = `uploads/${Folder}`
    return {
        storage: diskStorage({
            destination(
                req: Request,
                file: Express.Multer.File,
                callback:Function
            ) {
                let fullPath = path.resolve(`./${bathePath}`)
                if (!existsSync(fullPath)) {
                    mkdirSync(fullPath,{recursive:true})
                }
                callback(null,fullPath)
            },
            filename(
                req: Request,
                file: IMulterFile,
                callback:Function
            ) {
               
           const filename = randomUUID()+'_'+Date.now()+'_'+file.originalname
               
                file.finalPath = `${bathePath}/${filename}`
                callback(null, filename)
               }
            
        }),

        fileFilter(req: Request, file: IMulterFile, callback: Function) {
            console.log(validation, validation.includes(file.mimetype), file.mimetype)
            if (validation.includes(file.mimetype)) {
                return callback(null , true)
            }
            callback(new BadRequestException('In-Valid File format'))
        },
        limits: {
            fileSize:2*1024*1024
        }
    }
}