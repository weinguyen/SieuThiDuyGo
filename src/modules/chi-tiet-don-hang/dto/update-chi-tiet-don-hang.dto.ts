import { PartialType } from '@nestjs/swagger';
import { CreateChiTietDonHangDto } from './create-chi-tiet-don-hang.dto';

export class UpdateChiTietDonHangDto extends PartialType(CreateChiTietDonHangDto) {}
