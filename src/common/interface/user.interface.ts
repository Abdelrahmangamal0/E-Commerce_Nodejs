import { Types } from "mongoose";
import { OtpDocument } from "src/DB";
import { genderEnum, langEnum, providerEnum, roleEnum } from "../enums";
import { IProduct } from "./product.interface";

export interface IUser{
    _id?: Types.ObjectId,
    
     firstName: string
     
     lastName: string
     
     username?:string
    
     email: string
     
     confirmEmail?:Date
 
     password: string
    
     resetPassword?:Date
    
     provider:providerEnum
     
     gender:genderEnum
    
     role:roleEnum
 
     preferLanguage:langEnum
     
     changeCredentialsTime?:Date
     
     otp?: OtpDocument[]
     
     profilePicture?:string
     
     createdAt?:Date
    updatedAt?: Date
    
    wishList:Types.ObjectId[] | IProduct[]
  
}
