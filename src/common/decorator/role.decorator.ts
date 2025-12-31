import { SetMetadata } from "@nestjs/common";
import { roleEnum } from "../enums";

export const roleName ='accessRole'
export const Roles = (roles: roleEnum[]) => {
    return SetMetadata(roleName, roles )
}
