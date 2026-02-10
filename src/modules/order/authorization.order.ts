import { roleEnum } from "src/common";

export const endPoint ={
create:[roleEnum.User],
cancel:[roleEnum.User,roleEnum.Admin , roleEnum.superAdmin]
}