import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { RemoveItemsFromCartDto, UpdateCartDto } from './dto/update-cart.dto';
import { CartDocument, CartRepository, CategoryRepository, ProductRepository, userDocument, UserRepository } from 'src/DB';

@Injectable()
export class CartService {
  constructor(
     private readonly cartRepository:CartRepository ,
     private readonly productRepository:ProductRepository,
     private readonly categoryRepository:CategoryRepository,
     private readonly userRepository:UserRepository
   ){}
 async create(createCartDto: CreateCartDto, user: userDocument):Promise<{status:number , cart:CartDocument}> {
  
    const product = await this.productRepository.findOne({filter:{_id:createCartDto.productId ,  stock: { $gte: createCartDto.quantity }}})
    
   if (!product) {
     throw new BadRequestException('Fail to find matching product instance or product out of stock ')
   }

  //  console.log(product);
   
   const cart = await this.cartRepository.findOne({ filter: { createdBy: user._id } })
   
   if (!cart) {
     const [cart] = await this.cartRepository.create({
       Data: [{
         createdBy: user._id,
         products: [{
           productId:createCartDto.productId,
           quantity:createCartDto.quantity
         }]
       }]
     })

     if (!cart) {
      throw new BadRequestException('Fail to create  user cart')
     }

     return{status:201 , cart }
   }
   
   const checkProductInCart = cart?.products.find(product => {
      return product.productId == createCartDto.productId
   })

   if (checkProductInCart) {
    checkProductInCart.quantity = createCartDto.quantity
   } else {
     
     cart.products.push({productId:createCartDto.productId , quantity:createCartDto.quantity})
   }

   await cart.save()
   return {status:200 , cart}
  }
 async removeFromCart(removeItemsFromCartDto: RemoveItemsFromCartDto, user: userDocument):Promise<CartDocument> {
   
   const cart = await this.cartRepository.findOneAndUpdate({
     filter: {
        createdBy:user._id    
     },
     update: {
       $pull:{ products:{_id: { $in: removeItemsFromCartDto.productIds }}}
     }
   })
   
     if (!cart) {
      throw new NotFoundException('Fail to find user cart')
     }

     return cart as unknown as CartDocument
   }
   
 async remove(user: userDocument):Promise<string> {
   
   const cart = await this.cartRepository.deleteOne({
     filter: {
        createdBy:user._id    
     }
   })
   
     if (!cart) {
      throw new NotFoundException('Fail to find user cart')
     }

     return 'Done'
   }
   
 async findOne(user: userDocument):Promise<CartDocument> {
   
   const cart = await this.cartRepository.findOne({
     filter: {
        createdBy:user._id    
     },
     options:{populate:[{path:'products.productId'}]}
   })
   
     if (!cart) {
      throw new NotFoundException('Fail to find user cart')
     }

     return cart
   }
   

  
}
