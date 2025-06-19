import { OmitType } from '@nestjs/swagger';
import { TaiKhoan } from '../entities/tai-khoan.entity';

export class CreateTaiKhoanDto extends OmitType(TaiKhoan, [
  'id',
  'loai',
] as const) {}
