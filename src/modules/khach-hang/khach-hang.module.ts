import { Module } from '@nestjs/common';
import { KhachHangService } from './khach-hang.service';
import { KhachHangController } from './khach-hang.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhachHang } from './entities/khach-hang.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KhachHang])],
  controllers: [KhachHangController],
  providers: [KhachHangService],
  exports: [KhachHangService],
})
export class KhachHangModule {}
