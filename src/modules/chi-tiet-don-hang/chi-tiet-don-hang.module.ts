import { Module } from '@nestjs/common';
import { ChiTietDonHangService } from './chi-tiet-don-hang.service';
import { ChiTietDonHangController } from './chi-tiet-don-hang.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChiTietDonHang } from './entities/chi-tiet-don-hang.entity';
import { SanPham } from '../san-pham/entities/san-pham.entity';
import { DonHang } from '../don-hang/entities/don-hang.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChiTietDonHang, SanPham, DonHang])],

  providers: [ChiTietDonHangService],
  exports: [ChiTietDonHangService],
})
export class ChiTietDonHangModule {}
