import { DatabaseRepository } from "./db.repository";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { OrderDocument as TDocument  } from "../models";
import { Model } from "mongoose";
import { Order } from "../models";

@Injectable()
export class OrderRepository extends DatabaseRepository<Order>{
    constructor(@InjectModel('Order') protected override readonly model: Model<TDocument>) {
        super(model)
     }
    
}