import { PartialType } from '@nestjs/swagger';
import { DanhMuc } from '../entities/danh-muc.entity';

export class CreateDanhMucDto extends PartialType(DanhMuc) {}
