import { OrderType } from '@prisma/client';

export class InitTransactionDTO {
  assetId: string;
  walletId: string;
  shares: number;
  price: number;
  type: OrderType;
}

export class InputExecuteTransactionDTO {
  orderId: string;
  status: 'OPEN' | 'CLOSED';
  price: number;
  investorId: string;
  brokerTransactionId: string;
  negotiatedShares: number;
}
