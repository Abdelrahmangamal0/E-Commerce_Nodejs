import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { getSocketAuth } from "./socket";
import { Auth, IUser, NotificationEnum, roleEnum, TokenService, User } from "src/common";
import { ISocketAuth } from "src/common/interface/socket.interface";
import { connectedSockets, NotificationDocument, NotificationRepository, UserRepository, type userDocument } from "src/DB";
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
        private readonly tokenService:TokenService,
        private readonly notificationRepository:NotificationRepository,
        private readonly userRepository:UserRepository
    ) { }
  
    // @Auth([roleEnum.User])
    @SubscribeMessage('say')
    sayHi(@MessageBody() data: any , @ConnectedSocket() client :Socket  , @User() user:userDocument):string {
       
        console.log({data });
        console.log(user);
        
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
          
           const { user, decoded } = await this.tokenService.decodeToken(authorization)
          
           const userTaps = connectedSockets.get(user._id.toString()) || []
          
if (userTaps.includes(client.id)) {
    return;
           }
           
          userTaps.push(client.id)
          console.log('after' ,userTaps);
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
   
    @Auth([roleEnum.User])
    @SubscribeMessage('joinProduct')
    joinProduct(
      @MessageBody() data: { productId: string },
      @ConnectedSocket() client: Socket,
    ) {
       
        
        const productId = data.productId;
        client.join(`product-${productId}`)
   
        const room = `product-${productId}`
        const sockets = this.server.sockets.adapter.rooms.get(room)
        
        if (sockets) {
        //   console.log([...sockets]) 
        }
      
    }
    changeProductStock(
        products: { productId: Types.ObjectId, stock: number }[]
      ) {
         
        products.forEach(async (product) => {
            // const room = `product-${product.productId.toString()}`
            //  console.log(room);
             
            // const sockets =this.server.sockets.adapter.rooms.get(room)
            // console.log(
            //   `changeProductStock sent to ${sockets} `
          // )
        
            this.server
            .to(`product-${product.productId.toString()}`)
            .emit('changeProductStock', {  
              productId: product.productId,
              stock: product.stock,
            })
        })
      }
     
      @Auth([roleEnum.User])
      @SubscribeMessage('leaveProduct')
      leaveProduct(
        @MessageBody() data: { productId: string },
        @ConnectedSocket() client: Socket,
      ) {
    //    console.log(client);
       
          const productId = data.productId;
        client.leave(`product-${productId}`)
      
        // const sockets = this.server.sockets.adapter.rooms.get(`product-${productId}`)
        
        //   console.log('after leaved ' ,[...sockets || ' ']) 
        
      
      }
      
 async CouponOffer(couponId:Types.ObjectId , message:string='new Offer') {
   const data = {
        type: NotificationEnum.Offer,
        Entity:{kind:NotificationEnum.Offer , id:couponId },
        message,
     }  
    const users = await this.userRepository.find({
      filter:{}
    });
    await Promise.all(
      users.map((user:IUser) =>
        this.notificationRepository.create({
          Data: [{
          userId: user._id,
          ...data
          }]
        })
      )
    );
   
    this.server.emit('notification', data);
   
 }
  
   async SendToUser(userId: Types.ObjectId, data:Partial<NotificationDocument>) {
       await this.notificationRepository.create({
           Data:[ {
               userId,
               ...data
           }]
       })
       
       const sockets = connectedSockets.get(userId.toString()) || [];

       console.log(sockets);
       
       sockets.forEach(socketId => {
         this.server.to(socketId).emit('notification', data);
       });
      }

}