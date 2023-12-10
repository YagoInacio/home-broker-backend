import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma/prisma.service';

@Injectable()
export class WalletAssetsService {
  constructor(private prismaService: PrismaService) {}

  all(filter: { walletId: string }) {
    return this.prismaService.walletAsset.findMany({
      where: {
        walletId: filter.walletId,
      },
      include: {
        Asset: true,
      },
    });
  }

  create(input: { walletId: string; assetId: string; shares: number }) {
    return this.prismaService.walletAsset.create({
      data: {
        walletId: input.walletId,
        assetId: input.assetId,
        shares: input.shares,
        version: 1,
      },
    });
  }
}
