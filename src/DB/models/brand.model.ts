import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { emailEvent } from "src/common";
import { otpEnum } from "src/common/enums/otp.enum";
import { IBrand } from "src/common/interface/brand.interface";
import { IOtp } from "src/common/interface/otp.interface";
import { generateHash } from "src/common/utils/security/hash.security";

@Schema({timestamps:true ,   strictQuery: true, strict:true})
export class Brand implements IBrand {
    @Prop({type:String ,minLength:2 ,  maxLength:26, required:true  , unique:true }) 
    name: string
    
    @Prop({ type: String, minLength: 2, maxLength: 50}) 
    slug:string

    @Prop({ type: String, minLength: 2, maxLength: 26, required: true })   
    slogan: string
    @Prop({type:String , required:true})
    image: string
   
    @Prop({ type:Types.ObjectId ,ref:'User', required: true })  
    createdBy:Types.ObjectId  
   
    @Prop({ type: Date })
    freezedAt:Date
    
    @Prop({ type: Types.ObjectId, ref: 'User'})  
    freezedBy:Types.ObjectId
    
    @Prop({ type: Date })
    restoredAt: Date
    @Prop({ type: Types.ObjectId, ref: 'User'})  
    restoredBy:Types.ObjectId
    
    @Prop({ type: Types.ObjectId, ref: 'User' })  
    updatedBy: Types.ObjectId  
    
    pr
     
}

export type BrandDocument = HydratedDocument<Brand>

const BrandSchema = SchemaFactory.createForClass(Brand)


BrandSchema.pre('save', async function (next) {   
    if (
        this.isModified('name')) {
        this.slug = slugify(this.name , '_')
    } 
     next()
})
BrandSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {   
   const update = this.getUpdate() as UpdateQuery<BrandDocument>
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
BrandSchema.pre(['findOne', 'find'], async function (next) {   
   const query = this.getQuery()
        if (query.paranoId === false) {
            this.setQuery({...query})
        } else {
            this.setQuery({...query , freezedAt:{$exists:false} })
        }
     
     next()
})


export const BrandModel = MongooseModule.forFeature([{name:Brand.name , schema:BrandSchema}])
