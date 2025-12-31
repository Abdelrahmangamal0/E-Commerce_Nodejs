import { SetMetadata } from "@nestjs/common";
import { tokenEnum } from "../enums";

export const tokenName ='tokenType'
export const token = (type: tokenEnum = tokenEnum.access_token) => {
    return SetMetadata(tokenName, type )
}
