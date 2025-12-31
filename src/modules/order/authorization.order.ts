import { roleEnum } from "src/common";

export const endPoint ={
create:[roleEnum.User],
cancel:[roleEnum.Admin , roleEnum.superAdmin]
}