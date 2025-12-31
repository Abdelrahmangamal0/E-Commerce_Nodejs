import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import {ICategory } from "src/common";

@Schema({timestamps:true ,   strictQuery: true, strict:true})
export class Category implements ICategory {
    @Prop({type:String ,minLength:2 ,  maxLength:26, required:true  , unique:true }) 
    name: string
    
    @Prop({ type: String, minLength: 2, maxLength: 50}) 
    slug:string

    @Prop({ type: String, minLength: 2, maxLength: 50000})   
    description: string
    @Prop({type:String , required:true})
    image: string
   
    @Prop({type:String , required:true})
    assetFolderId: string
   
    @Prop({type:[{ type:Types.ObjectId ,ref:'Brand', required: true }]})  
    brands:Types.ObjectId[]  
   
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

export type CategoryDocument = HydratedDocument<Category>

const categorySchema = SchemaFactory.createForClass(Category)


categorySchema.pre('save', async function (next) {   
    if (
        this.isModified('name')) {
        this.slug = slugify(this.name , '_')
    } 
     next()
})
categorySchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {   
   const update = this.getUpdate() as UpdateQuery<CategoryDocument>
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
categorySchema.pre(['findOne', 'find'], async function (next) {   
   const query = this.getQuery()
        if (query.paranoId === false) {
            this.setQuery({...query})
        } else {
            this.setQuery({...query , freezedAt:{$exists:false} })
        }
     
     next()
})


export const CategoryModel = MongooseModule.forFeature([{name:Category.name , schema:categorySchema}])
