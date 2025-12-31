import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import {ICoupon, IOrderProduct, IOrder, IProduct, orderStatusEnum } from "src/common";
import {PaymentEnum } from "src/common/enums/order.enum";


@Schema({
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
    
export class OrderProduct implements IOrderProduct {
    @Prop({type:Types.ObjectId ,ref:'Product', required:true})
    productId: Types.ObjectId | IProduct ;
    @Prop({type:Number , required:true })
    quantity: number;
    @Prop({type:Number , required:true })
    unitPrice: number;   
    @Prop({type:Number , required:true })
    finalPrice: number;
    
}

const OrderProductSchema = SchemaFactory.createForClass(OrderProduct);

@Schema({
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
    export class Order implements IOrder {
       
        @Prop({type:String , required:true , unique:true })
        orderId: string;
        @Prop({type:String , required:true })
        address: string;
        @Prop({type:String , required:true })
        phone: string;
        @Prop({type:String , required:false })
        note?: string|undefined;
        @Prop({type:String , required:false })
        cancelReason?: string;
        @Prop({type:String ,enum:orderStatusEnum , default: function (this: any) {
            return this.payment ===PaymentEnum.Card?orderStatusEnum.Pending:orderStatusEnum.Placed
          } })
        status: orderStatusEnum;
        @Prop({type: String, enum: PaymentEnum, default:PaymentEnum.Cash})
        payment: PaymentEnum;
        
        @Prop({ type: Types.ObjectId, ref: 'Coupon' })
        coupon?: Types.ObjectId | ICoupon
       
        @Prop({ type: Number, default: 0 })
        discount: number
        @Prop({ type: Number, required: true })
        total:number
        @Prop({ type: Number})
        supTotal: number
        
        @Prop({ type: Date})
        paidAt?: Date
        @Prop({ type: String , required:false})
        paymentIntent?: string;
        @Prop({ type: String, required: false })
        intentId?: string;
       
        @Prop({ type: [OrderProductSchema] })
        products:OrderProduct[] 
    
        @Prop({ type: Types.ObjectId, ref: 'User', required: true })  
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
    
    
     
}

export type OrderDocument = HydratedDocument<Order>

const orderSchema = SchemaFactory.createForClass(Order)


orderSchema.pre('save', async function (next) {   
    if (
        this.isModified('total')) {
        this.supTotal = this.total - (this.total * this.discount)
    } 
     next()
})
orderSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {   
   const update = this.getUpdate() as UpdateQuery<OrderDocument>
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
orderSchema.pre(['findOne', 'find'], async function (next) {   
   const query = this.getQuery()
        if (query.paranoId === false) {
            this.setQuery({...query})
        } else {
            this.setQuery({...query , freezedAt:{$exists:false} })
        }
     
     next()
})


export const OrderModel = MongooseModule.forFeature([{name:Order.name , schema:orderSchema}])
