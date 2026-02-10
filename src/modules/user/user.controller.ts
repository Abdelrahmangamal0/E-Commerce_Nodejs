import {
    Controller,
    Get,
    UseInterceptors,
    Patch,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    UploadedFiles,
    Post,
    Body,
    Query,
    UsePipes,
    ValidationPipe,
    Param,
  } from '@nestjs/common';
  
  import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiConsumes,
    ApiBody,
    ApiParam,
    ApiQuery,
  } from '@nestjs/swagger';
  
  import { UserServices } from './user.services';
  import { type userDocument } from 'src/DB';
  import {
    Auth,
    cloudFileUpload,
    fileValidations,
    localFileUpload,
    roleEnum,
    storageEnum,
  } from 'src/common';
  
  import type { GetAllDTO, IMulterFile } from '../../common';
  import { Decode, User } from 'src/common/decorator/Credentials.decorator';
  import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
  import { IResponse } from 'src/common/interface/response.interface';
  import { successResponse } from 'src/common/utils/response';
  import {
    getOneNotificationResponse,
    NotificationResponse,
    ProfileResponse,
  } from './entities/user.entity';
  import type { JwtPayload } from 'jsonwebtoken';
  import { endPoint } from './authorization';
  import {
    UpdateParamsUserDto,
    UpdateUserDto,
  } from './dto/updateUser.dto';
  
  @ApiTags('User')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Controller('user')
  export class userController {
    constructor(private readonly userServices: UserServices) {}
  
    // ================= PROFILE =================
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({
      status: 200,
      description: 'User profile returned successfully',
    })
    @Auth(endPoint.profile)
    @Get('profile')
    async profile(
      @User() user: userDocument,
    ): Promise<IResponse<ProfileResponse>> {
      const profile = await this.userServices.profile(user);
      return successResponse<ProfileResponse>({ data: { profile } });
    }
  
    // ================= PROFILE IMAGE =================
    @ApiOperation({ summary: 'Update user profile image' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          profileImage: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    @ApiResponse({
      status: 200,
      description: 'Profile image updated successfully',
    })
    @UseInterceptors(
      FileInterceptor(
        'profileImage',
        cloudFileUpload({
          validation: fileValidations.Image,
          storageApproach: storageEnum.disk,
        }),
      ),
    )
    @Auth([roleEnum.User])
    @Patch('profileImage')
    async profileImage(
      @User() user: userDocument,
      @UploadedFile(
        new ParseFilePipe({
          fileIsRequired: true,
          validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
        }),
      )
      file: IMulterFile,
    ): Promise<IResponse<ProfileResponse>> {
      const profile = await this.userServices.profileImage(file, user);
      return successResponse<ProfileResponse>({ data: { profile } });
    }
  
    // ================= COVER IMAGE =================
    @ApiOperation({ summary: 'Update user cover images' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          coverImage: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    })
    @ApiResponse({
      status: 200,
      description: 'Cover images updated successfully',
    })
    @UseInterceptors(
      FilesInterceptor(
        'coverImage',
        2,
        localFileUpload({ Folder: 'User', validation: fileValidations.Image }),
      ),
    )
    @Auth([roleEnum.User])
    @Patch('coverImage')
    coverImage(
      @UploadedFiles(
        new ParseFilePipe({
          fileIsRequired: true,
          validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
        }),
      )
      files: Array<IMulterFile>,
    ) {
      return { message: 'Done', files };
    }
  
    // ================= UPDATE PASSWORD =================
    @ApiOperation({ summary: 'Update user password' })
    @ApiResponse({
      status: 200,
      description: 'Password updated successfully',
    })
    @ApiResponse({
      status: 400,
      description: 'Validation error',
    })
    @Auth([roleEnum.Admin, roleEnum.User, roleEnum.superAdmin])
    @Patch('update-password')
    async updatePassword(
      @User() user: userDocument,
      @Body() UpdateUserDto: UpdateUserDto,
    ): Promise<IResponse> {
      await this.userServices.updatePassword(UpdateUserDto, user);
      return successResponse();
    }
  
    // ================= NOTIFICATIONS =================
    @ApiOperation({ summary: 'Get user notifications' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiResponse({
      status: 200,
      description: 'Notifications fetched successfully',
    })
    @Auth(endPoint.profile)
    @Get('notifications')
    async notifications(
      @User() user: userDocument,
      @Query() query: GetAllDTO,
    ): Promise<IResponse<NotificationResponse>> {
      const notifications = await this.userServices.allNotification(query, user);
      return successResponse<NotificationResponse>({
        data: { notifications },
      });
    }
  
    // ================= SINGLE NOTIFICATION =================
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiParam({
      name: 'notificationId',
      description: 'Notification ID',
      example: '65a1c4f9b4c3e12a9d3e12ab',
    })
    @ApiResponse({
      status: 200,
      description: 'Notification updated successfully',
    })
    @Auth(endPoint.profile)
    @Patch(':notificationId/notifications')
    async getNotification(
      @User() user: userDocument,
      @Param() param: UpdateParamsUserDto,
    ): Promise<IResponse<getOneNotificationResponse>> {
      const notification = await this.userServices.getOneNotification(
        param.notificationId,
        user,
      );
      return successResponse<getOneNotificationResponse>({
        data: { notification },
      });
    }
  
    // ================= LOGOUT =================
    @ApiOperation({ summary: 'Logout current user' })
    @ApiResponse({
      status: 200,
      description: 'User logged out successfully',
    })
    @Auth([roleEnum.User])
    @Post('logout')
    async logout(
      @Decode() decoded: JwtPayload,
    ): Promise<IResponse> {
      await this.userServices.logout(decoded);
      return successResponse();
    }
  }
  