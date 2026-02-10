import { Types } from "mongoose";
import { NotificationEnum } from "../enums/notification.enum";

export interface INotification{
     _id?: Types.ObjectId
    
     userId:  Types.ObjectId
     
     title?:string
     message:string
    
     type: NotificationEnum
     Entity: {
          kind: NotificationEnum
          id:Types.ObjectId
     }

     isRead:String
     expiredAt:Date

     createdAt?: Date
     updatedAt?:Date
  
}
