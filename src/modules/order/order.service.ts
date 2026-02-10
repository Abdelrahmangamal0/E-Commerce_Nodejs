import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartRepository, CouponRepository, OrderProduct, OrderDocument, OrderRepository, ProductDocument, ProductRepository, userDocument, lean } from 'src/DB';
import { CouponEnum, GetAllDTO, GetAllGraphQlDTO, IOrder, NotificationEnum, orderStatusEnum, PaymentEnum, PaymentService } from 'src/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import Stripe from 'stripe';
import type{ Request } from 'express';
import { RealTimeGateway } from '../gateway/gateway';

@Injectable()
export class OrderService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly couponRepository: CouponRepository,
    private readonly productRepository: ProductRepository,
    private readonly realTimeGateway: RealTimeGateway,
  ) { }

  async webhook(req: Request) {
    // console.log(req.headers);
    
    const event = await this.paymentService.webhook(req)
  
      
    const { orderId } = event?.data.object.metadata as { orderId: string }
    const order = await this.orderRepository.findOneAndUpdate({
      filter: {
        _id: Types.ObjectId.createFromHexString(orderId),
        status: orderStatusEnum.Pending,
        payment: PaymentEnum.Card
      },
      update: {
        status: orderStatusEnum.Placed,
        paidAt: new Date()
      }
    })
    if (!order) {
      throw new NotFoundException("Fail to find matching order")
    }
    
   const confirm = await this.paymentService.confirmPaymentIntent(order.intentId as string)
    if (confirm.status == 'succeeded') {
      await this.realTimeGateway.SendToUser(order.createdBy, {
        title: 'Order Update',
        message: 'Your order is now shipped',
        type: NotificationEnum.Order,
        Entity:{kind:NotificationEnum.Order , id : order._id}
      
    })
    
  }
    
    return ""
  }
  
  async create(createOrderDto: CreateOrderDto, user: userDocument): Promise<OrderDocument> {
  
    const cart = await this.cartRepository.findOne({ filter: { createdBy: user._id } })
    
    
   
    if (!cart?.products.length) {
      throw new BadRequestException('Cart is Empty')
    }

    let discount = 0
    let coupon: any
    if (createOrderDto.coupon) {
      coupon = await this.couponRepository.findOne({
        filter: {
          _id: createOrderDto.coupon,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        }
      })

      
      if (!coupon) {
        throw new BadRequestException('Fail to find matching instance')
      }
    
      if (coupon.duration <= coupon.usedBy.filter((ele) => {
        return ele.toString() == user._id.toString()
      }).length
      ) {
        throw new BadRequestException(`sorry you have reached the limit for this coupon can you used only ${coupon.duration} try another valid coupon`)
      }
    }
 
    let products: OrderProduct[] = []
    let total = 0
      
    for (const product of cart.products) {
      const cartProduct = await this.productRepository.findOne({
        filter: {
          _id: product.productId,
          stock: { $gte: product.quantity }
        }
      })

      if (!cartProduct) {
        throw new BadRequestException(`Fail to find matching product :${product.productId} or out of stock`)
      }

      const finalPrice = cartProduct.salePice * product.quantity
      products.push({
        productId: product.productId,
        unitPrice: cartProduct.salePice,
        quantity: product.quantity,
        finalPrice
      })
      total += finalPrice

    }
    if (coupon) {
      // console.log(discount);
      discount = coupon.type == CouponEnum.Percent ? coupon.discount / 100 : coupon.discount / total
     
    }
   
    delete createOrderDto.coupon
      
    const [order] = await this.orderRepository.create({
      Data: [{
        ...createOrderDto,
        coupon: coupon?._id,
        discount,
        products,
        total,
        orderId: randomUUID().slice(0, 8),
        createdBy: user._id
        
      }]
    })

    if (!order) {
      throw new BadRequestException('Fail to create this order')
    }

    if (coupon) {
      coupon.usedBy.push(user._id)
      await coupon.save()
    }

    const stockProducts:{productId:Types.ObjectId , stock:number}[] = []
    for (const product of cart.products) {
      const updateProduct = await this.productRepository.findOneAndUpdate({
        filter: {
          _id: product.productId,
          stock: { $gte: product.quantity }
        },
        update: {
          $inc: { __v: 1, stock: -product.quantity }
        }
      }) as ProductDocument

      stockProducts.push({productId:updateProduct?._id , stock:updateProduct?.stock})
    }
   
      this.realTimeGateway.changeProductStock(stockProducts)
    
    await this.cartRepository.deleteOne({ filter: { createdBy: user._id } })

    return order

  }
 
  async cancel(orderId: Types.ObjectId, user: userDocument): Promise<OrderDocument> {
  
    const order = await this.orderRepository.findOneAndUpdate({
      filter: {
        _id: orderId,
        status:{$lt:orderStatusEnum.Cancel}
      },
      update: {
        status: orderStatusEnum.Cancel,
        updatedBy:user._id
      }
    }) 
    
    
    
    if (!order) {
      throw new BadRequestException('Fail to find matching instance ')
    }

    if (order.coupon) {
      await this.couponRepository.updateOne({
        filter: { _id: order.coupon },
        update: {
          $pull:{usedBy:order.createdBy}
        }
      })
    }

    for (const product of order.products) {
      const cartProduct = await this.productRepository.updateOne({
        filter: {
          _id: product.productId,
          stock: { $gte: product.quantity }
        },
        update: {
          $inc: { __v: 1, stock:product.quantity }
        }
      })

    }
      
    if (order.payment == PaymentEnum.Card) {
      console.log('refined');
     const refined = await this.paymentService.refined(order.intentId as string)
     console.log(refined);
     
    }
    
    await this.realTimeGateway.SendToUser(order.createdBy, {
      title: 'Order Update',
      message: 'Your order is now shipped',
      type: NotificationEnum.Order,
      Entity:{kind:NotificationEnum.Order , id : order._id}
    
  })
  
  //  console.log(order);
   
    return order as OrderDocument

  }
 
  async checkout(orderId: Types.ObjectId, user: userDocument) {
  
    const order = await this.orderRepository.findOne({
      filter: {
        _id: orderId,
        createdBy: user._id,
        payment: PaymentEnum.Card,
        status: orderStatusEnum.Pending
      },
      options: { populate: [{ path: 'products.productId', select: 'name' }] }
    })

    if (!order) {
      throw new NotFoundException('Fail to find matching order')
    }
    
  
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = []
    if (order.discount) {
      const coupon = await this.paymentService.createCoupon({
        duration: 'once',
        currency: 'egp',
        percent_off: Math.round(order.discount * 100)
              
      }
      )
      discounts.push({ coupon: coupon.id })
    }
    const session = await this.paymentService.checkOutSession({
      customer_email: user.email,
      metadata: { orderId: orderId.toString() },
      discounts,
      line_items: order.products.map(product => {
        return {
          quantity: product.quantity,
          price_data: {
            currency: 'egp',
            product_data: {
              name: (product.productId as ProductDocument).name
            },
            unit_amount: product.unitPrice * 100
          }
        }
      })
       
    
    })

    const method = await this.paymentService.createPaymentMethod({
      type: 'card',
      card: {
        token:'tok_visa'
      }
    })
    const intent = await this.paymentService.createPaymentIntent({
      amount: order.supTotal * 100,
      currency: 'egp',
      payment_method:method.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects:'never'
      }
    })

    order.intentId = intent.id
   
    await order.save()
   
  //   await this.realTimeGateway.SendToUser(order.createdBy, {
  //     title:'Order Update' ,
  //     message: 'Your order is now shipped',
  //     type: NotificationEnum.Order
    
  // })
 
    return session

  }



  async findAll(data: GetAllGraphQlDTO={}): Promise<{
    docsCount?: number,
    limit?: number,
    pages?: number,
    currentPage?: number | undefined,
    result: OrderDocument[] | lean<OrderDocument>[]
  }> {
        
    const { page, size, search } = data
        
    const orders = await this.orderRepository.paginate({
      filter: {
            
      },
      page,
      size,
      options: { populate: [{ path: 'createdBy' }] }
    })
    
    
    const result = {
      ...orders,
     orders:  orders.result.map(order => ({
        ...order,
        products:JSON.stringify( order.products.map(p => ({
          ...p,
          id: p._id,
       
          
        }))),
       
     }))
     
     
    }
 
    return  result;
      
  }

}