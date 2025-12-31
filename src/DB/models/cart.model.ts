import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import {ICart, ICartProduct } from "src/common";

@Schema({timestamps:true ,   strictQuery: true})
export class CartProduct implements ICartProduct {
    @Prop({type:Types.ObjectId , ref:'Product', required:true }) 
    productId: Types.ObjectId
   
    @Prop({type:Number, required:true }) 
    quantity: number;
     
}
@Schema({timestamps:true ,   strictQuery: true})
export class Cart implements ICart {
    @Prop([CartProduct]) 
    products: CartProduct[]
   
    @Prop({type:Types.ObjectId, ref:'User' ,required:true }) 
    createdBy: Types.ObjectId;
     
}

export type CartDocument = HydratedDocument<Cart>

const CartSchema = SchemaFactory.createForClass(Cart)


// CartSchema.pre('save', async function (next) {   
//     if (
//         this.isModified('name')) {
//         this.slug = slugify(this.name , '_')
//     } 
//      next()
// })
CartSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {   
   const update = this.getUpdate() as UpdateQuery<CartDocument>
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
CartSchema.pre(['findOne', 'find'], async function (next) {   
   const query = this.getQuery()
        if (query.paranoId === false) {
            this.setQuery({...query})
        } else {
            this.setQuery({...query , freezedAt:{$exists:false} })
        }
     
     next()
})


export const CartModel = MongooseModule.forFeature([{name:Cart.name , schema:CartSchema}])
