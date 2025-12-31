import { IResponse } from "../interface/response.interface";

export const successResponse = <T=any>({message='Done' , status=200 , data}:IResponse<T>={})=> {
    return {message , status , data}
}