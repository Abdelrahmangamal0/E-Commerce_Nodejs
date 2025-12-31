import { Socket } from "socket.io";


export const getSocketAuth = (client:Socket):string =>{

    const authorization = client.handshake.auth.authorization ?? client.handshake.headers.authorization 

    // console.log('authorization',authorization);
    
    if (!authorization) {
        client.emit("exception" , "missing authorization")
        // client.disconnect(true);
        
    }
   
    return authorization
}