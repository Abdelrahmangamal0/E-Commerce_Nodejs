import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { IBrand } from "./brand.interface";
import { ICategory } from "./category.interface";

export interface IProduct{
     _id?: Types.ObjectId,
    
     name: string
    
     slug:string
     description?:string
     
     images: string[]
     
     originalPrice: number
     discountPercent: number
     salePice: number
     
     stock: number
     soldItem: number
     
     category: Types.ObjectId | ICategory
     brand: Types.ObjectId | IBrand

     assetFolderId:string
     
     createdBy: Types.ObjectId | IUser  
     updatedBy?:Types.ObjectId |IUser  
    
     freezedAt?:Date     
     freezedBy?:Types.ObjectId
         
     restoredAt?: Date
     restoredBy?:Types.ObjectId
        
     createdAt?: Date
     updatedAt?:Date
  
}
