import { BadRequestException } from "@nestjs/common";
import type{ Request } from "express";
import { Coupon } from "src/DB";
import Stripe from "stripe";


export class PaymentService {

    private stripe: Stripe
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET as string)
    }
   
    async checkOutSession({
        customer_email,
        cancel_url = process.env.CANCEL_URL as string,
        success_url = process.env.SUCCESS_URL as string,
        metadata = {},
        discounts = [],
        mode = "payment",
        line_items
    }: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Response<Stripe.Checkout.Session>> {
        const session = await this.stripe.checkout.sessions.create({
            customer_email,
            cancel_url,
            success_url,
            metadata,
            discounts,
            mode,
            line_items
             
        })

        return session
    }

    async createCoupon(data: Stripe.CouponCreateParams): Promise<Stripe.Response<Stripe.Coupon>> {
        const coupon = await this.stripe.coupons.create(data)
        console.log({ coupon });
       
        return coupon
    }

    async webhook(req: Request) {
        const endPointSecret = process.env.STRIPE_HOOK_SECRET as string
        let event: Stripe.Event;
        try {
    
               event = this.stripe.webhooks.constructEvent(
                req.body,
                req.headers["stripe-signature"] as string,
                endPointSecret
            )
        } catch (err) {
            console.log('Webhook signature verification failed.', err.message);
            return;
        }


        if (event?.type !== 'checkout.session.completed') {
            throw new BadRequestException('Fail to pay')
        }
        console.log(event);
       
        return event
      

    }
  
    async createPaymentIntent(data: Stripe.PaymentIntentCreateParams):Promise<Stripe.Response<Stripe.PaymentIntent>> {
        const intent = await this.stripe.paymentIntents.create(data)
        return intent
    }
    async createPaymentMethod(data:Stripe.PaymentMethodCreateParams):Promise<Stripe.Response<Stripe.PaymentMethod>>  {
        const method = await this.stripe.paymentMethods.create(data)
        return method
    }
    async retrievePaymentIntent(id:string):Promise<Stripe.Response<Stripe.PaymentIntent>>  {
        const intent = await this.stripe.paymentIntents.retrieve(id)
        return intent
    }
    async confirmPaymentIntent(id:string):Promise<Stripe.Response<Stripe.PaymentIntent>>  {
        const intent = await this.retrievePaymentIntent(id) 
        if (intent.status !== 'requires_confirmation') {
            throw new BadRequestException('Fail to find matching intent')
        }

        const confirm = await this.stripe.paymentIntents.confirm(id)
        console.log(confirm);
        
        return confirm
    }
    async refined(id:string): Promise<Stripe.Response<Stripe.Refund>>  {
        const intent = await this.retrievePaymentIntent(id) 
        if (intent.status !== 'succeeded') {
            throw new BadRequestException('Fail to find matching intent')
        }

        const refined = await this.stripe.refunds.create({payment_intent:intent.id})
        
        return refined
    }
}
