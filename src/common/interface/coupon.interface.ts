import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { CouponEnum } from "../enums/coupon.enum";

export interface ICoupon{
     _id?: Types.ObjectId,
    
     name: string
    
     slug:string
     
     image: string

     usedBy:Types.ObjectId[] | IUser[]
     
     duration?:Number 
     discount:Number 
    
     type: CouponEnum 
     
     startDate: Date
     endDate: Date
     
     createdBy: Types.ObjectId | IUser  
     updatedBy?:Types.ObjectId |IUser  
    
     freezedAt?:Date     
     freezedBy?:Types.ObjectId
         
     restoredAt?: Date
     restoredBy?:Types.ObjectId
        
     createdAt?: Date
     updatedAt?:Date
  
}
