import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { S3Service } from './common';
import type { Response } from 'express';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { ApiOperation, ApiTags, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';

const createS3WriteStream = promisify(pipeline);

@ApiTags('Assets') // Tag for Swagger UI
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService, 
    private readonly s3Service: S3Service
  ) {}

  @Get('/upload/pre-signed/*path')
  @ApiOperation({ summary: 'Get pre-signed URL for uploading or downloading an asset', 
                  description: 'Generates a temporary pre-signed URL to upload or download a file from S3.' })
  @ApiParam({
    name: 'path',
    description: 'The S3 path of the file (wildcard path allowed)',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'download',
    description: 'Whether the URL is for downloading (true) or uploading (false)',
    enum: ['true', 'false'],
    required: true
  })
  @ApiQuery({
    name: 'filename',
    description: 'Optional filename for download',
    required: false
  })
  @ApiResponse({ status: 200, description: 'Pre-signed URL generated successfully' })
  async getPresignedAssetUrl(
    @Query() query: { download: 'true' | 'false'; filename?: string },
    @Param() params:{ path: string[] }
  ){
    const { download, filename } = query;
    const { path } = params;

    const Key = path.join('/');
    const url = await this.s3Service.createGetPreSignUploadLink({ Key, filename, download });

    return { message: 'Done', Data: { url } };
  }

  @Get('/upload/*path')
  @ApiOperation({ summary: 'Stream an asset from S3', 
                  description: 'Fetches a file from S3 and streams it directly to the client. Can optionally force download.' })
  @ApiParam({
    name: 'path',
    description: 'The S3 path of the file (wildcard path allowed)',
    type: 'string',
    required: true
  })
  @ApiQuery({
    name: 'download',
    description: 'Whether to force download of the file',
    enum: ['true', 'false'],
    required: true
  })
  @ApiQuery({
    name: 'filename',
    description: 'Optional filename for download',
    required: false
  })
  @ApiResponse({ status: 200, description: 'File streamed successfully' })
  @ApiResponse({ status: 400, description: 'Failed to fetch asset' })
  async getAsset(
    @Query() query: { download: 'true' | 'false'; filename?: string },
    @Param() params: { path: string[] },
    @Res({ passthrough: true }) res: Response
  ){
    const { download, filename } = query;
    const { path } = params;

    const Key = path.join('/');
    const s3Response = await this.s3Service.getFile({ Key });
    if (!s3Response?.Body) {
        throw new BadRequestException('Failed to fetch this asset');
    }

    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Type', s3Response.ContentType || 'application/octet-stream');

    if (download === 'true') {
        res.setHeader('Content-Disposition', `attachment; filename="${filename || Key.split('/').pop()}"`);
    }

    return await createS3WriteStream(s3Response.Body as NodeJS.ReadableStream, res);
  }

  @Get()
  @ApiOperation({ summary: 'Hello endpoint', description: 'Returns a simple greeting message' })
  @ApiResponse({ status: 200, description: 'Greeting message returned successfully' })
  getHello(): string {
    return this.appService.getHello();
  }
}
