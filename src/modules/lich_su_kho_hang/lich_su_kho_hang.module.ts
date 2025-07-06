import { Module } from '@nestjs/common';
import { LichSuKhoHangService } from './lich_su_kho_hang.service';
import { LichSuKhoHangController } from './lich_su_kho_hang.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LichSuKhoHang } from './entities/lich_su_kho_hang.entity';
import { SanPham } from '../san-pham/entities/san-pham.entity';
import { NhanVien } from '../nhan-vien/entities/nhan-vien.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LichSuKhoHang, SanPham, NhanVien])],
  controllers: [LichSuKhoHangController],
  providers: [LichSuKhoHangService],
})
export class LichSuKhoHangModule {}
