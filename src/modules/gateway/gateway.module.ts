import { Module } from "@nestjs/common";
import { RealTimeGateway } from "./gateway";
import { SharedAuthModule, TokenService } from "src/common";
import {NotificationModel, NotificationRepository } from "src/DB";

@Module({
    imports:[SharedAuthModule , NotificationModel],
  providers: [RealTimeGateway, NotificationRepository],
    
  })
  export class  RealTimeModule {}
  