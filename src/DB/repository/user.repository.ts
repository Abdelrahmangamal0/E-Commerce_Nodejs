import { DatabaseRepository } from "./db.repository";
import { userDocument as TDocument, User } from "../models/user.model";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class UserRepository extends DatabaseRepository<User> {
  
    constructor(@InjectModel('User') protected override readonly model: Model<TDocument>) 
        {
            super(model)
        }
    
    
}