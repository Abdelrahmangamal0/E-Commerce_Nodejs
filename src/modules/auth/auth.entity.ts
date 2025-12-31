import { IUser } from "src/common";
import { IResponse } from "src/common/interface/response.interface";

export class LoginResponse{
    credentials: {access_token:string , refresh_token:string}
   
}
