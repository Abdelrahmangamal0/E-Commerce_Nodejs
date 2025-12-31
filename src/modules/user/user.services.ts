import { Injectable, Req } from "@nestjs/common";
import { JwtPayload } from "jsonwebtoken";
import { S3Service, storageEnum, tokenEnum } from "src/common";
import { TokenService } from "src/common/services/token/token.service";
import { userDocument } from "src/DB";

@Injectable()
export class UserServices {
    
    constructor(
        private readonly s3Service: S3Service,
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





    async logout(decoded: JwtPayload):Promise<string> {
        await this.tokenService.revokeToken(decoded)
    

        return 'Done'
    }

}