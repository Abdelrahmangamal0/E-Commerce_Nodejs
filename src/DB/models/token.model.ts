import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IToken } from "src/common/interface/token.interface";



@Schema({timestamps:true})
export class Token implements IToken {
  @Prop({type: String, required:true, unique: true })
  jti: string
 
  @Prop( { type: Number, required: true })
  expireAt:Number
  @Prop({ type:Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId

}
   
export const tokenSchema = SchemaFactory.createForClass(Token)
export type TokenDocument = HydratedDocument<Token>

tokenSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 })

export const tokenModel = MongooseModule.forFeature([{name:Token.name ,schema:tokenSchema}] )
