import { PartialType } from '@nestjs/swagger';
import { CreateLichSuKhoHangDto } from './create-lich_su_kho_hang.dto';

export class UpdateLichSuKhoHangDto extends PartialType(CreateLichSuKhoHangDto) {}
