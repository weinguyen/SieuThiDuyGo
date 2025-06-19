import { PartialType } from '@nestjs/mapped-types';
import { CreateSanPhamDto } from './create-sanpham.dto';
export class UpdateSanPhamDto extends PartialType(CreateSanPhamDto) {}
