import { Module } from "@nestjs/common";
import {tokenModel, userModel, UserRepository } from "src/DB";
import { TokenService } from "src/common/services/token/token.service";
import { SignatureService } from "src/common/services/token/signature.token";
import { TokenRepository } from "src/DB/repository/token.repository";
import { JwtService } from "@nestjs/jwt";
import { createClient } from "redis";


@Module({
    imports: [
        userModel , tokenModel],
    providers: [
        UserRepository,
        TokenRepository,
        TokenService,
        SignatureService,
        JwtService, {
            provide: 'REDIS_CLIENT',
            useFactory: async () => {
                const client = createClient({
                    url:'redis://localhost:6379'
                })
                client.on('error', (err) => console.error('redis client Error', err))
                await client.connect()
                console.log('Redis Connected ✅');
                
                 return client   
            }
        }
    ],
    exports: [
        UserRepository,
        TokenRepository,
        TokenService,
        SignatureService,
        'REDIS_CLIENT'
    ]
})

export class SharedAuthModule{}
