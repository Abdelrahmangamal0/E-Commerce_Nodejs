import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import {ICoupon} from "src/common";
import {CouponEnum } from "src/common/enums/coupon.enum";

@Schema({timestamps:true ,   strictQuery: true, strict:true})
export class Coupon implements ICoupon {
    @Prop({type:String ,minLength:2 ,  maxLength:26, required:true  , unique:true }) 
    name: string
    
    @Prop({ type: String, minLength: 2, maxLength: 50}) 
    slug:string

    @Prop({type:String , required:true})
    image: string
   
    @Prop({type:Number , required:false})
    
    duration?: number;
    
    @Prop({type:Number , default:1})
    discount: number;
    
    @Prop({type:String ,enum:CouponEnum, default:CouponEnum.Percent})
    type: CouponEnum;
    
    @Prop({type:Date , required:true})
    startDate: Date;
    
    @Prop({type:Date , required:true})
    endDate: Date;

   
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })  
    createdBy:Types.ObjectId  
   
    @Prop({type:[{ type: Types.ObjectId, ref: 'User', required: true }]})  
    usedBy: Types.ObjectId[] 
   
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
    
    
     
}

export type CouponDocument = HydratedDocument<Coupon>

const couponSchema = SchemaFactory.createForClass(Coupon)


couponSchema.pre('save', async function (next) {   
    if (
        this.isModified('name')) {
        this.slug = slugify(this.name , '_')
    } 
     next()
})
couponSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {   
   const update = this.getUpdate() as UpdateQuery<CouponDocument>
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
couponSchema.pre(['findOne', 'find'], async function (next) {   
   const query = this.getQuery()
        if (query.paranoId === false) {
            this.setQuery({...query})
        } else {
            this.setQuery({...query , freezedAt:{$exists:false} })
        }
     
     next()
})


export const CouponModel = MongooseModule.forFeature([{name:Coupon.name , schema:couponSchema}])
