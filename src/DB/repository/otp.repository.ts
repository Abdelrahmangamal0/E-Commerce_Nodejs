import { DatabaseRepository } from "./db.repository";
import { Otp, OtpDocument as TDocument} from "../models";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class OtpRepository extends DatabaseRepository<Otp>{
    constructor(@InjectModel('Otp') protected override readonly model: Model<TDocument>) {
        super(model)
     }
    
}