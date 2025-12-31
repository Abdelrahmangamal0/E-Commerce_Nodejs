import { ObjectType } from "@nestjs/graphql";
import { Types } from "mongoose";


export interface IToken {
   _id?:Types.ObjectId
    
    jti: string,
    expireAt: Number,
    createdBy: Types.ObjectId
    
    createdAt?: Date
    updatedAt?:Date
 
}