import { Module } from '@nestjs/common';
import { NhanVienService } from './nhan-vien.service';
import { NhanVienController } from './nhan-vien.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NhanVien } from './entities/nhan-vien.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NhanVien])],
  controllers: [NhanVienController],
  providers: [NhanVienService],
})
export class NhanVienModule {}
