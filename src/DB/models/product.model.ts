import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { IProduct } from "src/common";

@Schema({timestamps:true ,   strictQuery: true, strict:true})
export class Product implements IProduct {
    @Prop({type:String ,minLength:2 ,  maxLength:2000, required:true }) 
    name: string
    
    @Prop({ type: String, minLength: 2, maxLength: 50}) 
    slug:string

    @Prop({ type: String, minLength: 2, maxLength: 50000})   
    description: string
   
    @Prop({ type: [String], required: true })
    images: string[]
    
    @Prop({ type:Number, required:true })
    originalPrice: number;
   
    @Prop({ type: Number, default: 0 })
    discountPercent: number;
    
    @Prop({ type: Number,required:true  })
    salePice: number;
     
    @Prop({ type:Types.ObjectId ,ref:'Brand', required: true })  
    brand:Types.ObjectId  
   
    @Prop({ type:Types.ObjectId ,ref:'Category', required: true })  
    category:Types.ObjectId 
   
    @Prop({ type: Number,  required: true})
    stock: number;
   
    @Prop({ type: Number, default: 0 })
    soldItem: number;
   
    @Prop({ type: String,  required: true})
    assetFolderId:string
     
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

export type ProductDocument = HydratedDocument<Product>

const productSchema = SchemaFactory.createForClass(Product)


productSchema.pre('save', async function (next) {   
    if (
        this.isModified('name')) {
        this.slug = slugify(this.name , '_')
    } 
     next()
})
productSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {   
   const update = this.getUpdate() as UpdateQuery<ProductDocument>
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
productSchema.pre(['findOne', 'find'], async function (next) {   
   const query = this.getQuery()
        if (query.paranoId === false) {
            this.setQuery({...query})
        } else {
            this.setQuery({...query , freezedAt:{$exists:false} })
        }
     
     next()
})


export const ProductModel = MongooseModule.forFeature([{name:Product.name , schema:productSchema}])
