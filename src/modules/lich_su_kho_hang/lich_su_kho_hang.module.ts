import { Module } from '@nestjs/common';
import { LichSuKhoHangService } from './lich_su_kho_hang.service';
import { LichSuKhoHangController } from './lich_su_kho_hang.controller';

@Module({
  controllers: [LichSuKhoHangController],
  providers: [LichSuKhoHangService],
})
export class LichSuKhoHangModule {}
