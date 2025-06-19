import { PartialType } from '@nestjs/swagger';
import { CreateTaiKhoanDto } from './create-tai-khoan.dto';

export class UpdateTaiKhoanDto extends PartialType(CreateTaiKhoanDto) {}
