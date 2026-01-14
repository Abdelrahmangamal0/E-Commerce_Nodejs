import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { getSocketAuth } from "./socket";
import { Auth, roleEnum, TokenService, User } from "src/common";
import { ISocketAuth } from "src/common/interface/socket.interface";
import { connectedSockets, type userDocument } from "src/DB";
import { Types } from "mongoose";


@WebSocketGateway({
    cors: {
        origin: "*"
    },
    // namespace:"public"
})
export class RealTimeGateway  implements OnGatewayInit ,OnGatewayConnection ,OnGatewayDisconnect{
    
    @WebSocketServer()
    private readonly server:Server
   
   
    constructor(
        private readonly tokenService:TokenService
    ) { }
  
    @Auth([roleEnum.Admin])
    @SubscribeMessage('sayHi')
    sayHi(@MessageBody() data: any , @ConnectedSocket() client :Socket  , @User() user:userDocument):string {
        // console.log({data });
        // console.log(user);
        
        this.server.emit('sayHi' , 'Nest To FE')
        // client.broadcast.emit('sayHi' , 'Nest To FE')
        return 'relived data'
        
    }
    
    afterInit(server: Server) {
        console.log('RealTime Gateway Started 🚀🚀 ');
        
    }

   async handleConnection(client: ISocketAuth) {
       try {
         
          const authorization = getSocketAuth(client)
          const {user , decoded} = await this.tokenService.decodeToken(authorization)
          const userTaps = connectedSockets.get(user._id.toString())|| []
           userTaps.push(client.id)
           connectedSockets.set(user._id.toString() ,userTaps )
           client.credentials = { user, decoded } 
       
          console.log('connection',connectedSockets);
      
       } catch (error) {
        console.log(error , 'error');
        
           client.emit('exception', error.message || 'something is warning') 
           
       }
       
  
    }

    handleDisconnect(client: ISocketAuth) {
        const userId = client.credentials?.user?._id.toString() as string
        let remainingTaps = connectedSockets.get(userId)?.filter((tap: string) => { return tap !== client.id }) || [];
          
        if (remainingTaps.length) {
            connectedSockets.set(userId, remainingTaps);
            
        } else {
            connectedSockets.delete(userId);
            
            this.server.emit('offline_user', userId);
        }
        console.log(`Logout ::: ${client.id}`);
        console.log('after Logout ',connectedSockets);
        
      
      
    }


    changeProductStock(products: { productId: Types.ObjectId, stock: number }[]) {
        this.server.emit('changeProductStock' , products)
    }


}