import { DatabaseRepository } from "./db.repository";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CartDocument as TDocument  } from "../models";
import { Model } from "mongoose";
import { Cart } from "../models";

@Injectable()
export class CartRepository extends DatabaseRepository<Cart>{
    constructor(@InjectModel('Cart') protected override readonly model: Model<TDocument>) {
        super(model)
     }
    
}