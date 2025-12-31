import { DatabaseRepository } from "./db.repository";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ProductDocument as TDocument  } from "../models";
import { Model } from "mongoose";
import { Product } from "../models";

@Injectable()
export class ProductRepository extends DatabaseRepository<Product>{
    constructor(@InjectModel('Product') protected override readonly model: Model<TDocument>) {
        super(model)
     }
    
}