import { Injectable } from '@nestjs/common';
import {
  OrderRepository,
  ProductRepository,
  UserRepository,
} from 'src/DB';
import { orderStatusEnum } from 'src/common/enums/order.enum'; 
import type { IOrder } from 'src/common'; 

@Injectable()
export class DashboardUsersService {
  constructor(private readonly userRepository: UserRepository) {} 

  async getOverview() {
    const totalUsers = await this.userRepository.countDocuments({
      filter: {},
    }); // تعليق: حساب إجمالي عدد المستخدمين

    return {
      totalUsers,
    };
  }
}

@Injectable()
export class DashboardProductsService {
  constructor(private readonly productRepository: ProductRepository) {} // تعليق: الاعتماد على ProductRepository لحساب إحصائيات المنتجات

  async getOverview() {
    const totalProducts = await this.productRepository.countDocuments({
      filter: {},
    }); // تعليق: حساب إجمالي عدد المنتجات

    return {
      totalProducts,
    };
  }
}

@Injectable()
export class DashboardOrdersService {
  constructor(private readonly orderRepository: OrderRepository) {} // تعليق: الاعتماد على OrderRepository لحساب إحصائيات الطلبات

  async getOverview() {
    const totalOrders = await this.orderRepository.countDocuments({
      filter: {},
    });

    const [
      pendingOrders,
      placedOrders,
      onWayOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      this.orderRepository.countDocuments({
        filter: { status: orderStatusEnum.Pending },
      }),
      this.orderRepository.countDocuments({
        filter: { status: orderStatusEnum.Placed },
      }),
      this.orderRepository.countDocuments({
        filter: { status: orderStatusEnum.OnWay },
      }),
      this.orderRepository.countDocuments({
        filter: { status: orderStatusEnum.Delivered },
      }),
      this.orderRepository.countDocuments({
        filter: { status: orderStatusEnum.Cancel },
      }),
    ]);

    const revenueOrders = (await this.orderRepository.find({
      filter: {
        status: {
          $gte: orderStatusEnum.Placed,
          $lt: orderStatusEnum.Cancel,
        },
      },
    })) as IOrder[];

    const totalRevenue = revenueOrders.reduce((sum: number, order: IOrder) => {
      const value = order.supTotal ?? order.total ?? 0;
      return sum + Number(value || 0);
    }, 0);

    return {
      totalOrders,
      totalRevenue,
      ordersByStatus: {
        pending: pendingOrders,
        placed: placedOrders,
        onWay: onWayOrders,
        delivered: deliveredOrders,
        cancel: cancelledOrders,
      },
    };
  }
}

@Injectable()
export class DashboardOverviewService {
  constructor(
    private readonly usersService: DashboardUsersService,
    private readonly ordersService: DashboardOrdersService,
    private readonly productsService: DashboardProductsService,
  ) {} 
  async getOverview() {
    const [userStats, orderStats, productStats] = await Promise.all([
      this.usersService.getOverview(),
      this.ordersService.getOverview(),
      this.productsService.getOverview(),
    ]);

    return {
      ...userStats,
      ...productStats,
      ...orderStats,
    };
  }
}

