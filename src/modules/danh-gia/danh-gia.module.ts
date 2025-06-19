import { Module } from '@nestjs/common';
import { DanhGiaService } from './danh-gia.service';
import { DanhGiaController } from './danh-gia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DanhGia } from './entities/danh-gia.entity';
import { KhachHang } from '../khach-hang/entities/khach-hang.entity';
import { SanPham } from '../san-pham/entities/san-pham.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DanhGia, KhachHang, SanPham])],
  controllers: [DanhGiaController],
  providers: [DanhGiaService],
})
export class DanhGiaModule {}
