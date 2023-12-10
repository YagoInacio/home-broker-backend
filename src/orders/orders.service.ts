import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma/prisma.service';
import { InitTransactionDTO, InputExecuteTransactionDTO } from './order.dto';
import { OrderStatus, OrderType } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prismaService: PrismaService) {}

  all(filter: { walletId: string }) {
    return this.prismaService.order.findMany({
      where: {
        walletId: filter.walletId,
      },
      include: {
        Transactions: true,
        Asset: {
          select: {
            id: true,
            ticker: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  initTransaction(input: InitTransactionDTO) {
    return this.prismaService.order.create({
      data: {
        ...input,
        partial: input.shares,
        status: OrderStatus.PENDING,
        version: 1,
      },
    });
  }

  async executeTransaction(input: InputExecuteTransactionDTO) {
    return this.prismaService.$transaction(async (prisma) => {
      const order = await prisma.order.findUniqueOrThrow({
        where: {
          id: input.orderId,
        },
      });

      await prisma.order.update({
        where: {
          id: input.orderId,
          version: order.version,
        },
        data: {
          partial: order.partial - input.negotiatedShares,
          status: input.status,
          Transactions: {
            create: {
              brokerTransactionId: input.brokerTransactionId,
              investorId: input.investorId,
              shares: input.negotiatedShares,
              price: input.price,
            },
          },
          version: { increment: 1 },
        },
      });

      if (input.status === OrderStatus.CLOSED) {
        await prisma.asset.update({
          where: {
            id: order.assetId,
          },
          data: {
            price: input.price,
          },
        });

        const walletAssetExists = await prisma.walletAsset.findUnique({
          where: {
            walletId_assetId: {
              assetId: order.assetId,
              walletId: order.walletId,
            },
          },
        });

        if (walletAssetExists) {
          await prisma.walletAsset.update({
            where: {
              walletId_assetId: {
                assetId: order.assetId,
                walletId: order.walletId,
              },
              version: walletAssetExists.version,
            },
            data: {
              shares:
                order.type === OrderType.BUY
                  ? walletAssetExists.shares + order.shares
                  : walletAssetExists.shares - order.shares,
              version: { increment: 1 },
            },
          });
        } else {
          await prisma.walletAsset.create({
            data: {
              assetId: order.assetId,
              walletId: order.walletId,
              shares: order.shares,
              version: 1,
            },
          });
        }
      }
    });
  }
}
