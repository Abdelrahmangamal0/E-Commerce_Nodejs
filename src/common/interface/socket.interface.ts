import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import { userDocument } from "src/DB";


export interface ISocketAuth extends Socket{
    credentials: {
        user: userDocument,
        decoded:JwtPayload
    }
}