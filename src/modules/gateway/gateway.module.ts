import { Module } from "@nestjs/common";
import { RealTimeGateway } from "./gateway";
import { SharedAuthModule, TokenService } from "src/common";

@Module({
    imports:[SharedAuthModule],
    providers: [RealTimeGateway]
  })
  export class  RealTimeModule {}
  