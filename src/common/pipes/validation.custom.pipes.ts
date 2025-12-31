
// import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
// import { ZodType } from 'zod';

// @Injectable()
// export class customValidationPipe implements PipeTransform {
//   constructor(private schema:ZodType){}
//     transform(value: any, metadata: ArgumentMetadata) {
//        const {error , success} = this.schema.safeParse(value) 
       
//         if (!success) {
//             throw new BadRequestException({
//                 message: 'Validation error',
//                 cause: {
//                     issues: error.issues.map(issue => {
//                         return {path:issue.path , message:issue.message}
//                     })
                        
                    
//                 }
//             })
//         }
//         return value;
//   }
// }
