import { PartialType } from '@nestjs/swagger';
import { CreateDanhMucDto } from './create-danh_muc.dto';

export class UpdateDanhMucDto extends PartialType(CreateDanhMucDto) {}
