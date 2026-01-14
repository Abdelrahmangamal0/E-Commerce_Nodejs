import { Injectable, NotFoundException, Req } from "@nestjs/common";
import { JwtPayload } from "jsonwebtoken";
import { compareHash, generateHash, S3Service, storageEnum, tokenEnum } from "src/common";
import { TokenService } from "src/common/services/token/token.service";
import { userDocument, UserRepository } from "src/DB";
import { UpdateUserDto } from "./dto/updateUser.dto";

@Injectable()
export class UserServices {
    
    constructor(
        private readonly s3Service: S3Service,
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService
    ) { }
    async profile(user: userDocument): Promise<userDocument> {
      
      
        const Profile = await user.populate({ path: 'wishList' })
        return Profile
    }



    async profileImage(file: Express.Multer.File, user: userDocument) {
        
        user.profilePicture = await this.s3Service.uploadFile({
            file,
            storageApproach: storageEnum.disk,
            path: `user/${user._id.toString()}`
        })
        user.save()
        return user
    }


    async updatePassword(UpdateUserDto:UpdateUserDto , user: userDocument): Promise<String> {
      const {oldPassword , newPassword} = UpdateUserDto
        
        if (!(await compareHash(oldPassword, user.password))) {
            throw new NotFoundException(' your password is not correct ')
        }
        if ((await compareHash(newPassword, user.password))) {
            throw new NotFoundException('please enter new password')
        }
        
        const updatePassword = await this.userRepository.findOneAndUpdate({
            filter: { _id: user._id },
            update: {
                password:newPassword,
                changeCredentialsTime: Date.now()
            }
        })
        
        return 'Done'
    }



    async logout(decoded: JwtPayload):Promise<string> {
        await this.tokenService.revokeToken(decoded)
    

        return 'Done'
    }

}