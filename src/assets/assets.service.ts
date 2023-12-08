import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma/prisma.service';

interface CreateAssetRequest {
  id: string;
  ticker: string;
  price: number;
}

@Injectable()
export class AssetsService {
  constructor(private prismaService: PrismaService) {}

  all() {
    return this.prismaService.asset.findMany();
  }

  create({ id, price, ticker }: CreateAssetRequest) {
    return this.prismaService.asset.create({
      data: {
        id,
        price,
        ticker,
      },
    });
  }
}
