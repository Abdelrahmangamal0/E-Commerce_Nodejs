// user.module.ts
import { MiddlewareConsumer, Module, forwardRef } from "@nestjs/common";
import { UserServices } from "./user.services";
import { userController } from "./user.controller";
import { preAuth } from "src/common/middleware/authentication.middleware";
import { SharedAuthModule } from "src/common/services/modules/auth.module";
import { S3Service } from "src/common";
import { NotificationModel, NotificationRepository } from "src/DB";
import { S3Client } from "@aws-sdk/client-s3";


@Module({
    imports: [SharedAuthModule , NotificationModel ],
    providers: [UserServices , S3Service , NotificationRepository , S3Client],
    controllers: [userController],
    exports: [],
})
export class userModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(preAuth).forRoutes(userController)
    }
}
