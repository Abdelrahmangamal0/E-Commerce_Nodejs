// user.module.ts
import { MiddlewareConsumer, Module, forwardRef } from "@nestjs/common";
import { UserServices } from "./user.services";
import { userController } from "./user.controller";
import { preAuth } from "src/common/middleware/authentication.middleware";
import { SharedAuthModule } from "src/common/services/modules/auth.module";
import { S3Service } from "src/common";
import { NotificationModel, NotificationRepository } from "src/DB";


@Module({
    imports: [SharedAuthModule , NotificationModel ],
    providers: [UserServices , S3Service , NotificationRepository],
    controllers: [userController],
    exports: [],
})
export class userModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(preAuth).forRoutes(userController)
    }
}
