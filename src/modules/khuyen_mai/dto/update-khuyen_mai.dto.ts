import { PartialType } from '@nestjs/swagger';
import { CreateKhuyenMaiDto } from './create-khuyen_mai.dto';

export class UpdateKhuyenMaiDto extends PartialType(CreateKhuyenMaiDto) {}
