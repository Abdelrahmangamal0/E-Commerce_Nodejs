// user.module.ts
import { MiddlewareConsumer, Module, forwardRef } from "@nestjs/common";
import { UserServices } from "./user.services";
import { userController } from "./user.controller";
import { preAuth } from "src/common/middleware/authentication.middleware";
import { SharedAuthModule } from "src/common/services/modules/auth.module";
import { S3Service } from "src/common";


@Module({
    imports: [SharedAuthModule ],
    providers: [UserServices , S3Service],
    controllers: [userController],
    exports: [],
})
export class userModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(preAuth).forRoutes(userController)
    }
}
