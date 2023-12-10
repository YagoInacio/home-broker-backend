import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { InitTransactionDTO, InputExecuteTransactionDTO } from './order.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

type ExecuteTransactionMessage = {
  orderId: string;
  investorId: string;
  assetId: string;
  orderType: string;
  status: 'OPEN' | 'CLOSED';
  partial: number;
  shares: number;
  transactions: {
    transactionId: string;
    buyerId: string;
    sellerId: string;
    assetId: string;
    price: number;
    shares: number;
  }[];
};

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
  executeTransactionRest(@Body() body: InputExecuteTransactionDTO) {
    return this.ordersService.executeTransaction(body);
  }

  @MessagePattern('output')
  async executeTransactionkafka(@Payload() message: ExecuteTransactionMessage) {
    const transaction = message.transactions[message.transactions.length - 1];
    await this.ordersService.executeTransaction({
      orderId: message.orderId,
      status: message.status,
      price: transaction.price,
      investorId:
        message.orderType === 'BUY'
          ? transaction.sellerId
          : transaction.buyerId,
      brokerTransactionId: transaction.transactionId,
      negotiatedShares: transaction.shares,
    });
  }
}
