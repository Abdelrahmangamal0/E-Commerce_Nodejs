import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import { Types } from "mongoose"
import { otpEnum } from "src/common/enums/otp.enum"
import { CreateNumberOtp } from "src/common/utils/otp"
import { UserRepository } from "src/DB"
import { OtpRepository } from "src/DB/repository/otp.repository"
import { authLoginDTO, authSignupDTO, confirmEmailDTO, resendEmailDTO, resetPasswordDTO } from "./dto/auth.signup.dto"
import { compareHash } from "src/common/utils/security/hash.security"
import { TokenService } from "src/common/services/token/token.service"
import { providerEnum } from "src/common"
import { randomUUID } from "crypto"


@Injectable()
export class authServices{
    constructor(
      private readonly userModel:UserRepository,
      private readonly otpModel:OtpRepository ,
      private readonly tokenService:TokenService){}
    private async createConfirmOtp(userId: Types.ObjectId , otpType:otpEnum) {
        await this.otpModel.create({
            Data: [{
                code: CreateNumberOtp(),
                expiredAt: new Date(Date.now() + 2 * 60 * 1000),
                createdBy: userId,
                type: otpType
            }]
        })
    }
    
    
  
    async signup(data:authSignupDTO ) {
     const checkUserExist = await this.userModel.findOne({filter:{email:data.email}}) 
     
      if (checkUserExist) {
          throw new ConflictException('user already exist')
      }
  

      const [user] = await this.userModel.create({ Data: [{ ...data }] })
      
      if (!user) {
          throw new BadRequestException('Fail to create user')
      }
      
      
      await  this.createConfirmOtp(user._id , otpEnum.confirmEmail) 
    //   emailEvent.emit(otpEnum.confirmEmail,{to:user.email , otp:'123454'})
      return user
  }    
   
    
    
    
    async resendEmail(data: resendEmailDTO) {
       
       const {email} = data  
        const user = await this.userModel.findOne({
            filter: {
                email: email,
                confirmEmail:{$exists:false}
            },
            options: {
                populate:([{path:'otp'  , match:{type:otpEnum.confirmEmail}}])
            }
        }) 
     
      if (!user) {
          throw new ConflictException('Fail to find match account')
      }
  
        
        if (user.otp?.length) {
         throw new ConflictException(`Sorry we can not generate new otp until the existing one become expired Please try again after ${user.otp[0].expiredAt} `)
     }
      
      await  this.createConfirmOtp(user._id , otpEnum.confirmEmail)
   
     return 'done'
  }    
    
    
    async confirmEmail(data: confirmEmailDTO) {
       
       const {email , otp} = data  
        const user = await this.userModel.findOne({
            filter: {
                email: email,
                confirmEmail:{$exists:false}
            },
            options: {
                populate:([{path:'otp'  , match:{type:otpEnum.confirmEmail}}])
            }
        }) 
     
      if (!user) {
          throw new ConflictException('email or otp is In-Valid ')
      }
  
        if (!(user.otp?.length && await compareHash(otp , user?.otp[0].code )) ) {
           throw new NotFoundException(' email or otp is In-Valid ')
     }
      
        await this.userModel.updateOne({
            filter: { email },
            update: {
                confirmEmail:Date.now()
            }
        })
        
        await this.otpModel.deleteOne({
            filter:{_id : user.otp[0]._id}
        })
   
     return 'done'
  }    
    
    
    
     async sendForgotPassword (data:resendEmailDTO): Promise<string> { 
               
           const {email} = data
           
      let user = await this.userModel.findOne({
         filter: {
            email,
            provider: providerEnum.System,
            confirmAt:{$exists:true}
              }
           })
      
      
      
      if (!user) {
         throw new NotFoundException('In-Valid account due to one of flowing reasons {Not register ,Invalid provider , Not Confirmed-email }')
      }

      await  this.createConfirmOtp(user._id , otpEnum.resetPassword)
      

      return 'Done'
   
   }
 
     async verifyForgotPassword (data:confirmEmailDTO): Promise<string> { 
               
           const {email , otp} = data
           
      let user = await this.userModel.findOne({
         filter: {
            email,
            provider: providerEnum.System,
            confirmAt:{$exists:true}
              },
              options: {
                populate:([{path:'otp'  , match:{type:otpEnum.resetPassword}}])
            }
        }) 
     
      if (!user) {
          throw new ConflictException('email or otp is In-Valid ')
      }
  
        if (!(user.otp?.length && await compareHash(otp , user?.otp[0].code )) ) {
           throw new NotFoundException(' email or otp is In-Valid ')
     }
        
     await this.userModel.updateOne({
        filter: { email },
        update: {
            resetPassword:Date.now()
        }
    })
      
      return 'Done'
   
   }
 

   
    async resetForgotPassword (data:resetPasswordDTO): Promise<string> { 
     
               
      const {email,otp,password} = data
      
 let user = await this.userModel.findOne({
    filter: {
       email,
       provider: providerEnum.System,
       resetPassword:{$exists:true}
     },
     options: {
        populate:([{path:'otp'  , match:{type:otpEnum.resetPassword}}])
    }
      })
 
 
 
 if (!user) {
    throw new NotFoundException('In-Valid account due to one of flowing reasons {Not register ,Invalid provider , Not Confirmed-email }')
 }

 if (!(user.otp?.length && await compareHash(otp , user?.otp[0].code )) ) {
    throw new NotFoundException(' email or otp is In-Valid ')
}      
  
await this.userModel.updateOne({
    filter: { email },
    update: {
        changeCredentialsTime: Date.now(),
        password,
        $unset:{resetPassword: 1}
    }
})
        
 await this.otpModel.deleteOne({
    filter: {
        createdBy:user._id
    }
})
  
        return 'Done'

}

  
    
    
   async login(data: authLoginDTO){
        
        const {email , password} = data
        const user = await this.userModel.findOne({
            filter: {
                email,
                confirmEmail:{$exists:true}
            }
        }) 
     
      if (!user) {
          throw new ConflictException('email or password is In-Valid ')
      }
  
        if (!(await compareHash(password , user?.password )) ) {
           throw new NotFoundException(' email or password is In-Valid ')
     }
       
       
       const credentials = await this.tokenService.createLoginCredentials(user) 
        
       return credentials
    }    
}