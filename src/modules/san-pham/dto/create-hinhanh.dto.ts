import { OmitType } from '@nestjs/swagger';
import { HinhAnhSanPham } from '../entities/hinh-anh.entity';

export class CreateHinhAnhDto extends OmitType(HinhAnhSanPham, ['id']) {}
