import { DatabaseRepository } from "./db.repository";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Notification, NotificationDocument as TDocument  } from "../models";
import { Model } from "mongoose";

@Injectable()
export class NotificationRepository extends DatabaseRepository<Notification>{
    constructor(@InjectModel('Notification') protected override readonly model: Model<TDocument>) {
        super(model)
     }
    
}