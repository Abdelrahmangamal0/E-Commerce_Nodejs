import { DatabaseRepository } from "./db.repository";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BrandDocument as TDocument  } from "../models";
import { Model } from "mongoose";
import { Brand } from "../models";

@Injectable()
export class BrandRepository extends DatabaseRepository<Brand>{
    constructor(@InjectModel('Brand') protected override readonly model: Model<TDocument>) {
        super(model)
     }
    
}