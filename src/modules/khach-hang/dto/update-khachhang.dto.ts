import { PartialType } from '@nestjs/mapped-types';
import { CreateKhachHangDto } from './create-khachhang.dto';

export class UpdateKhachHangDto extends PartialType(CreateKhachHangDto) {}
