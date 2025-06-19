import { PartialType } from '@nestjs/swagger';
import { CreateDonHangDto } from './create-don-hang.dto';

export class UpdateDonHangDto extends PartialType(CreateDonHangDto) {}
