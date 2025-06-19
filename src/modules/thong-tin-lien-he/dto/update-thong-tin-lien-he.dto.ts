import { PartialType } from '@nestjs/swagger';
import { CreateThongTinLienHeDto } from './create-thong-tin-lien-he.dto';

export class UpdateThongTinLienHeDto extends PartialType(CreateThongTinLienHeDto) {}
