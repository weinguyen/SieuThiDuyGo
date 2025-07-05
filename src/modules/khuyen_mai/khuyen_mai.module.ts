import { Module } from '@nestjs/common';
import { KhuyenMaiService } from './khuyen_mai.service';
import { KhuyenMaiController } from './khuyen_mai.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhuyenMai } from './entities/khuyen_mai.entity';
import { SanPham } from '../san-pham/entities/san-pham.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KhuyenMai, SanPham])],
  controllers: [KhuyenMaiController],
  providers: [KhuyenMaiService],
})
export class KhuyenMaiModule {}
