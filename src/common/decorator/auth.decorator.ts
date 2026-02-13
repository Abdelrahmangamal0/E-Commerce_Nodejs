import { roleEnum } from "../enums/user.enum";
import { applyDecorators, UseGuards } from "@nestjs/common";
import { token } from "./tokenType.decorator";
import { AuthenticationGuard } from "../Guard/authentication/authentication.guard";
import { AuthorizationGuard } from "../Guard/authorization/authorization.guard";
import { Roles } from "./role.decorator";
import { tokenEnum } from "../enums";

export function Auth(roles: roleEnum[], type: tokenEnum = tokenEnum.access_token) {
 
    return applyDecorators(
        token(type),
        Roles(roles),
       UseGuards(AuthenticationGuard,AuthorizationGuard)
    )
}