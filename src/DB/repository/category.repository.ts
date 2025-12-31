import { DatabaseRepository } from "./db.repository";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CategoryDocument as TDocument  } from "../models";
import { Model } from "mongoose";
import { Category } from "../models";

@Injectable()
export class CategoryRepository extends DatabaseRepository<Category>{
    constructor(@InjectModel('Category') protected override readonly model: Model<TDocument>) {
        super(model)
     }
    
}