import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { S3Service } from './common';
import type { Response } from 'express';
import { promisify } from 'util';
import { pipeline } from 'stream';

const createS3WriteStream = promisify(pipeline)

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, 
              private readonly s3Service:S3Service     
  ) {}

  @Get('/upload/pre-signed/*path')
  async getPresignedAssetUrl(
    @Query() query: { download: 'true' | 'false' ; filename?: string },
    @Param() params:{path:string[]}
  ){
    const {download , filename} = query 
    const {path} = params
    
    
    const Key = path.join("/");
    const url = await this.s3Service.createGetPreSignUploadLink({ Key , filename , download })
    
    console.log('URL: ' , url);
    
    // console.log(req.params[0] as unknown as { path: string[] });
    return {message:'Done' , Data:{url}}
  
} 



@Get('/upload/*path')
async getAsset(
  @Query() query: { download: 'true' | 'false' ; filename?: string },
  @Param() params: { path: string[] },
  @Res({passthrough:true}) res:Response
){
  const {download , filename} = query 
  const {path} = params
 // console.log(req.params as unknown as {path:string[]})
    const Key = path.join("/");
    const s3Response = await this.s3Service.getFile({ Key })
    if (!s3Response?.Body) {
        throw new BadRequestException('fail to fetch this asset')
    }
    
    res.set('Cross-Origin-Resource-Policy' , 'cross-origin ')

    res.setHeader('Content-Type', `${s3Response.ContentType}` || 'application/octet_stream') 
    if (download  == 'true') {
        
        res.setHeader('Content-Disposition',`attachment ; filename = "${filename || Key.split('/').pop()}" `)
    }
  return await createS3WriteStream(s3Response.Body as NodeJS.ReadableStream , res)
  
} 

 


  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
