import { OmitType } from '@nestjs/swagger';
import { ChiTietDonHang } from '../entities/chi-tiet-don-hang.entity';

export class CreateChiTietDonHangDto extends OmitType(ChiTietDonHang, [
  'thanhTien',
] as const) {}
