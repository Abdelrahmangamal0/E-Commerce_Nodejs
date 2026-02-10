import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { INotification, NotificationEnum } from "src/common";

@Schema({timestamps:true ,   strictQuery: true, strict:true})
export class Notification implements INotification {
   
    @Prop({ type:Types.ObjectId ,ref:'User', required: true })  
    userId:Types.ObjectId  
   
    @Prop({type:String , required:false})     
    title?:string
    @Prop({type:String , required:true})     
    message:string
    
    @Prop({type:String , enum:NotificationEnum ,required:true})
    type: NotificationEnum
    @Prop({
        type: {
          kind: { type: String, enum: NotificationEnum, required: true },
            id: { type: Types.ObjectId, required: true },
            _id: false,
        },
        required: true,
      }) 
    Entity: { kind: NotificationEnum; id: Types.ObjectId; };
    @Prop({type:String , default:'false'})     
    isRead:String
    
    @Prop({type: Date , default: () => new Date ( Date.now() + 30 * 24 * 60 * 60 * 1000) })
     expiredAt: Date 
    
     
}

export type NotificationDocument = HydratedDocument<Notification>

const NotificationSchema = SchemaFactory.createForClass(Notification)

NotificationSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 })

NotificationSchema.pre('save', async function (next) {   
     next()
})
NotificationSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {   
   const update = this.getUpdate() as UpdateQuery<NotificationDocument>
    if (update.name){
        this.setUpdate({...update ,slug:slugify(update.name , '_') })
    } 
    const query = this.getQuery()
        if (query.paranoId === false) {
            this.setQuery({...query})
        } else {
            this.setQuery({...query , freezedAt:{$exists:false} })
        }
    
  
     next()
})
NotificationSchema.pre(['findOne', 'find'], async function (next) {   
   const query = this.getQuery()
        if (query.paranoId === false) {
            this.setQuery({...query})
        } else {
            this.setQuery({...query , freezedAt:{$exists:false} })
        }
     
     next()
})


export const NotificationModel = MongooseModule.forFeature([{name:Notification.name , schema:NotificationSchema}])
