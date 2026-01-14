import { Controller, Get,  UseInterceptors  ,Headers, Patch, UploadedFile, ParseFilePipe, MaxFileSizeValidator, UploadedFiles, Post, Body} from "@nestjs/common";
import { UserServices } from "./user.services";
import { type userDocument } from "src/DB";
import { Auth, cloudFileUpload, fileValidations, localFileUpload, roleEnum, storageEnum} from "src/common";
import type {IMulterFile, IUser} from '../../common'
import { Decode, User } from "src/common/decorator/Credentials.decorator";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { IResponse } from "src/common/interface/response.interface";
import { successResponse } from "src/common/utils/response";
import { ProfileResponse } from "./entities/user.entity";
import type { JwtPayload } from "jsonwebtoken";
import mongoose from 'mongoose';
import { endPoint } from "./authorization";
import { UpdateUserDto } from "./dto/updateUser.dto";

@Controller('user')
export class userController{
    constructor(
        private readonly userServices:UserServices
    ){}
    @Auth(endPoint.profile)
    // @UseInterceptors(applyLangInterceptor)
    @Get('profile')
    async profile(
        // @Headers() header:any,
        @User() user: userDocument
    ):Promise<IResponse<ProfileResponse>>
    {
        const profile = await this.userServices.profile(user)
        // return of({data:{User} , header }).pipe(delay(10000))
        return successResponse<ProfileResponse>({data:{profile} })
    }

   
   
    // @UseInterceptors(FileInterceptor('profileImage', localFileUpload({Folder:'User' , validation:fileValidations.Image})))
    // @Auth([roleEnum.User])
    // @Patch('profileImage')
    // profileImage(
    //     @UploadedFile(new ParseFilePipe({
    //         fileIsRequired: true,
    //         validators:[new MaxFileSizeValidator({maxSize:2*1024*1024})]
    //     })) file:IMulterFile
    // ) {
    //     return {message:'Done' , file}
    // }
    @UseInterceptors(FileInterceptor('profileImage', cloudFileUpload({
        validation: fileValidations.Image,
        storageApproach:storageEnum.disk
    })))
    @Auth([roleEnum.User])
    @Patch('profileImage')
   
    async profileImage(
        @User() user:userDocument ,
        @UploadedFile(new ParseFilePipe({
            fileIsRequired: true,
            validators:[new MaxFileSizeValidator({maxSize:2*1024*1024})]
        })) file:IMulterFile
    ):Promise<IResponse<ProfileResponse>> {
        
        const profile = await this.userServices.profileImage(file , user)
        
        return successResponse<ProfileResponse>({data:{profile} })
    }

  

    @UseInterceptors(FilesInterceptor('coverImage', 2 ,localFileUpload({Folder:'User' , validation:fileValidations.Image})))
    @Auth([roleEnum.User])
    @Patch('coverImage')
    coverImage(
        @UploadedFiles(new ParseFilePipe({
            fileIsRequired: true,
            validators:[new MaxFileSizeValidator({maxSize:2*1024*1024})]
        })) files:Array<IMulterFile>
    ) {
        return {message:'Done' , files}
    }

    @Auth([roleEnum.Admin,roleEnum.User , roleEnum.superAdmin])
    @Patch('update-password')
    async updatePassword(
       
        @User() user: userDocument ,
        @Body() UpdateUserDto:UpdateUserDto
    ):Promise<IResponse>
    {
        const result = await this.userServices.updatePassword(UpdateUserDto,user)
        return successResponse()
    }

   


@Auth([roleEnum.User])    
@Post('logout')
async logout(
      @Decode() decoded:JwtPayload
       ):Promise<IResponse>{
        
        //   console.log(decoded);
          
          await this.userServices.logout(decoded)
          return successResponse()
    }

}






