import { Module } from '@nestjs/common';
import { DonHangService } from './don-hang.service';
import { DonHangController } from './don-hang.controller';
import { DonHang } from './entities/don-hang.entity';
import { ChiTietDonHang } from '../chi-tiet-don-hang/entities/chi-tiet-don-hang.entity';
import { KhachHang } from '../khach-hang/entities/khach-hang.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SanPham } from '../san-pham/entities/san-pham.entity';
import { NhanVien } from '../nhan-vien/entities/nhan-vien.entity';
import { ThongTinLienHe } from '../thong-tin-lien-he/entities/thong-tin-lien-he.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DonHang,
      ChiTietDonHang,
      KhachHang,
      SanPham,
      NhanVien,
      ThongTinLienHe,
    ]),
  ],
  controllers: [DonHangController],
  providers: [DonHangService],
})
export class DonHangModule {}
