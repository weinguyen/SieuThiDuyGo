import { PartialType } from '@nestjs/swagger';
import { CreateSanPhamDto } from './create-sanpham.dto';
export class UpdateSanPhamDto extends PartialType(CreateSanPhamDto) {}
