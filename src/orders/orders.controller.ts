import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { InitTransactionDTO, InputExecuteTransactionDTO } from './order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  all(@Query('walletId') walletId: string) {
    return this.ordersService.all({
      walletId,
    });
  }

  @Post()
  initTransaction(@Body() body: InitTransactionDTO) {
    return this.ordersService.initTransaction(body);
  }

  @Post('execute')
  executeTransaction(@Body() body: InputExecuteTransactionDTO) {
    return this.ordersService.executeTransaction(body);
  }
}
