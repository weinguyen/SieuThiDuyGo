import { Module } from '@nestjs/common';
import { SanPhamService } from './san-pham.service';
import { SanPhamController } from './san-pham.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SanPham } from './entities/san-pham.entity';
import { HinhAnhSanPham } from './entities/hinh-anh.entity';
import { NhanVien } from '../nhan-vien/entities/nhan-vien.entity';
import { DanhMuc } from '../danh-muc/entities/danh-muc.entity';
import { ChiTietDonHang } from '../chi-tiet-don-hang/entities/chi-tiet-don-hang.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SanPham,
      HinhAnhSanPham,
      NhanVien,
      DanhMuc,
      ChiTietDonHang,
    ]),
  ],
  controllers: [SanPhamController],
  providers: [SanPhamService],
})
export class SanPhamModule {}
