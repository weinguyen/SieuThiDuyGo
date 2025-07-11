import { PartialType, PickType } from '@nestjs/swagger';
import { CreateDonHangDto } from './create-don-hang.dto';
import { DonHang } from '../entities/don-hang.entity';

export class UpdateDonHangDto extends PickType(DonHang, ['trangThaiDonHang']) {}
