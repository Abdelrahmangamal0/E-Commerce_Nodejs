// import { EventEmitter } from 'node:events'
// import { deleteFile, getFile } from './s3.config'


// export const s3Event = new EventEmitter({})
// s3Event.on('trackProfileImageUpload',async (Data) => {
//     console.log(Data);
    
//     const userRepository 
    
//     setTimeout(async() => {
//         try {
//             await getFile({ Key: Data.Key })
    
//             await userModelRepository.updateOne({
//                 filter: { _id: Data.userId },
//                 update: {
//                     $unset: { temporaryImage: 1 }
//                 }
//             })
//             if (Data.oldKey && Data.oldKey !== Data.Key) {
//                 await deleteFile({ Key: Data.oldKey })
//             }
//             console.log('Done ☘️✨')
//         } catch (error:any) {
//             console.log(error)
//             if (error.Code == 'NoSuchKey') {
          
//                 await userModelRepository.updateOne({
//                     filter: { _id: Data.userId },
//                     update: {
//                         $set: { profileImage: Data.oldKey },
//                         $unset: { temporaryImage: 1 }
                  
//                     }
//                 })
//             }
    
//         }
//     },Data.expireIn || Number(process.env.AWS_S3_EXPIRE_IN)*1000)
// })
