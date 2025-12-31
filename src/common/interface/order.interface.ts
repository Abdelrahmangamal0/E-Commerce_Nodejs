import { Types } from "mongoose";
import { IProduct } from "./product.interface";
import { orderStatusEnum, PaymentEnum } from "../enums";
import { ICoupon } from "./coupon.interface";
import { IUser } from "./user.interface";

export interface IOrderProduct {

    id?: Types.ObjectId;
    productId: Types.ObjectId | IProduct;
    quantity: number;
    unitPrice: number;
    finalPrice: number;
    createdAt?: Date
    updatedAt?:Date
    
}


export interface IOrder{
    id?: Types.ObjectId;
    orderId: string;
    address: string;
    phone: string;
    note?: string;
    cancelReason?: string;
    status: orderStatusEnum;
    payment: PaymentEnum;
    coupon?:Types.ObjectId | ICoupon
    discount?:number
    total:number
    supTotal: number
    paidAt?: Date
    paymentIntent?: string;
    intentId?: string;
    
    products:IOrderProduct[]

    createdBy: Types.ObjectId | IUser 
    updatedBy?: Types.ObjectId | IUser
   
    freezedAt?: Date     
    freezedBy?:Types.ObjectId
             
    restoredAt?: Date
    restoredBy?:Types.ObjectId
            
    createdAt?: Date
    updatedAt?:Date
      
}