import { roleEnum, SignatureLevel } from "src/common/enums";

export class SignatureService{
    constructor() { }
    
    detectSignatureLevel(role:roleEnum) {
        switch (role) {
            case roleEnum.Admin:
            case roleEnum.superAdmin:
                return SignatureLevel.System
            
            default:
                return SignatureLevel.Bearer         
        }
    }

    getSignature(Level: string) {
        if (Level === SignatureLevel.System) {
            return{
            access : process.env.ACCESS_SYSTEM_TOKEN_SIGNATURE as string,
            refresh : process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE as string
            }
        }
        
        return {
            access : process.env.ACCESS_USER_TOKEN_SIGNATURE,
            refresh : process.env.REFRESH_USER_TOKEN_SIGNATURE  
        }
    }
}