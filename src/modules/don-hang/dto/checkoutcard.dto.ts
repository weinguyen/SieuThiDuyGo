import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { PhuongThucThanhToan } from '../common/constant';
import { DonHang } from '../entities/don-hang.entity';

export class CheckoutCartDto extends OmitType(DonHang, ['id', 'tongTien']) {
  @IsString()
  @ApiProperty({ description: 'Địa chỉ giao hàng' })
  diaChiGiaoHang: string;

  @IsString()
  @ApiProperty({ description: 'Số điện thoại người nhận' })
  sdtNguoiNhan: string;

  @IsString()
  @ApiProperty({ description: 'Tên người nhận' })
  tenNguoiNhan: string;

  @IsString()
  @ApiProperty({ description: 'Ghi chú' })
  ghiChu?: string;
}
