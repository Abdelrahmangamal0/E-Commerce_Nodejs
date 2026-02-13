import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, IResponse, roleEnum } from 'src/common'; // تعليق: ديكور المصادقة + واجهة الاستجابة الموحدة
import { successResponse } from 'src/common/utils/response'; // تعليق: دالة توليد استجابة موحدة
import {
  DashboardOverviewService,
  DashboardUsersService,
  DashboardOrdersService,
  DashboardProductsService,
} from './services'; 
@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardOverviewService,
  ) {} 
  @Auth([roleEnum.Admin, roleEnum.superAdmin]) 
  @Get('overview')
  @ApiOperation({
    summary: 'Get admin dashboard overview',
    description:
      'Returns high-level statistics for admin dashboard (users, orders, products, revenue).',
  })
  async getOverview(): Promise<IResponse<any>> {
    const data = await this.dashboardService.getOverview(); 
    return successResponse({ data }); 
  }
}

@ApiTags('Dashboard - Users') 
@ApiBearerAuth()
@Controller('dashboard/users')
export class DashboardUsersController {
  constructor(private readonly usersService: DashboardUsersService) {} 
  
  @Auth([roleEnum.Admin, roleEnum.superAdmin])
  @Get('overview')
  @ApiOperation({
    summary: 'Get users dashboard overview',
    description: 'Returns high-level statistics about users for the dashboard.',
  })
  async getOverview(): Promise<IResponse<any>> {
    const data = await this.usersService.getOverview(); // تعليق: جلب إحصائيات المستخدمين
    return successResponse({ data });
  }
}

@ApiTags('Dashboard - Orders') // تعليق: واجهات خاصة بإحصائيات الطلبات
@ApiBearerAuth()
@Controller('dashboard/orders')
export class DashboardOrdersController {
  constructor(private readonly ordersService: DashboardOrdersService) {} // تعليق: خدمة الطلبات في لوحة التحكم
  
  @Auth([roleEnum.Admin, roleEnum.superAdmin])
  @Get('overview')
  @ApiOperation({
    summary: 'Get orders dashboard overview',
    description:
      'Returns high-level statistics about orders (counts, revenue, status breakdown).',
  })
  async getOverview(): Promise<IResponse<any>> {
    const data = await this.ordersService.getOverview(); // تعليق: جلب إحصائيات الطلبات
    return successResponse({ data });
  }
}

@ApiTags('Dashboard - Products') // تعليق: واجهات خاصة بإحصائيات المنتجات
@ApiBearerAuth()
@Controller('dashboard/products')
export class DashboardProductsController {
  constructor(
    private readonly productsService: DashboardProductsService,
  ) {} // تعليق: خدمة المنتجات في لوحة التحكم
  
  @Auth([roleEnum.Admin, roleEnum.superAdmin])
  @Get('overview')
  @ApiOperation({
    summary: 'Get products dashboard overview',
    description: 'Returns high-level statistics about products for the dashboard.',
  })
  async getOverview(): Promise<IResponse<any>> {
    const data = await this.productsService.getOverview(); // تعليق: جلب إحصائيات المنتجات
    return successResponse({ data });
  }
}

