import { DatabaseRepository } from "./db.repository";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CouponDocument as TDocument  } from "../models";
import { Model } from "mongoose";
import { Coupon } from "../models";

@Injectable()
export class CouponRepository extends DatabaseRepository<Coupon>{
    constructor(@InjectModel('Coupon') protected override readonly model: Model<TDocument>) {
        super(model)
     }
    
}