import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { IBrand } from "./brand.interface";

export interface ICategory{
     _id?: Types.ObjectId,
    
     name: string
    
     slug:string
     description?:string
     
     image: string

     assetFolderId:string
     
     brands:Types.ObjectId[] | IBrand[]
     
     createdBy: Types.ObjectId | IUser  
     updatedBy?:Types.ObjectId |IUser  
    
     freezedAt?:Date     
     freezedBy?:Types.ObjectId
         
     restoredAt?: Date
     restoredBy?:Types.ObjectId
        
     createdAt?: Date
     updatedAt?:Date
  
}
