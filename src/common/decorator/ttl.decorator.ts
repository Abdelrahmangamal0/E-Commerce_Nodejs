import { SetMetadata } from "@nestjs/common";

export const ttlName ='ttlName'
export const TTL = (expires:number ) => {
    return SetMetadata(ttlName, expires )
}
