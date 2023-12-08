import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WalletAssetsService } from './wallet-assets.service';

@Controller('wallets/:walletId/assets')
export class WalletAssetsController {
  constructor(private readonly walletsAssetsService: WalletAssetsService) {}

  @Get()
  all(@Param('walletId') walletId: string) {
    return this.walletsAssetsService.all({
      walletId,
    });
  }

  @Post()
  create(
    @Param('walletId') walletId: string,
    @Body() body: { assetId: string; shares: number },
  ) {
    return this.walletsAssetsService.create({
      walletId,
      ...body,
    });
  }
}
