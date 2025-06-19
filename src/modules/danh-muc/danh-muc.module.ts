import { Module } from '@nestjs/common';
import { DanhMucService } from './danh-muc.service';
import { DanhMucController } from './danh-muc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DanhMuc } from './entities/danh-muc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DanhMuc])],
  controllers: [DanhMucController],
  providers: [DanhMucService],
})
export class DanhMucModule {}
