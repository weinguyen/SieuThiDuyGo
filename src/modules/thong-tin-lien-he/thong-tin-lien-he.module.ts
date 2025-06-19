import { Module } from '@nestjs/common';
import { ThongTinLienHeService } from './thong-tin-lien-he.service';
import { ThongTinLienHeController } from './thong-tin-lien-he.controller';
import { ThongTinLienHe } from './entities/thong-tin-lien-he.entity';
import { DonHang } from '../don-hang/entities/don-hang.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ThongTinLienHe, DonHang])],
  controllers: [ThongTinLienHeController],
  providers: [ThongTinLienHeService],
})
export class ThongTinLienHeModule {}
