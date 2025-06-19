import { Module } from '@nestjs/common';
import { TaiKhoanService } from './tai-khoan.service';
import { TaiKhoanController } from './tai-khoan.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { TaiKhoan } from './entities/tai-khoan.entity';
import { NhanVien } from '../nhan-vien/entities/nhan-vien.entity';
import { KhachHang } from '../khach-hang/entities/khach-hang.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaiKhoan, NhanVien, KhachHang])],
  controllers: [TaiKhoanController],
  providers: [TaiKhoanService],
  exports: [TaiKhoanService],
})
export class TaiKhoanModule {}
