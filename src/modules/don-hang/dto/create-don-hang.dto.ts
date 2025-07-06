import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';
import { PhuongThucThanhToan } from '../common/constant';

class ChiTietDonHangDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 1 })
  @IsNumber()
  sanPhamId: number;

  @ApiProperty({ description: 'Số lượng', example: 2 })
  @IsNumber()
  @Min(1)
  soLuong: number;
}

export class CreateDonHangDto {
  @ApiProperty({ description: 'ID khách hàng', example: 1 })
  @IsNumber()
  khachHangId: number;

  @ApiProperty({ description: 'Tên đơn hàng', example: 'Đơn hàng #001' })
  @IsString()
  @IsNotEmpty()
  tenDonHang: string;

  @ApiProperty({
    description: 'Phương thức thanh toán',
    enum: PhuongThucThanhToan,
    example: PhuongThucThanhToan.COD,
  })
  @IsEnum(PhuongThucThanhToan)
  phuongThucThanhToan: PhuongThucThanhToan;

  @ApiProperty({
    description: 'Ngày chuẩn bị hàng',
    type: 'string',
    format: 'date',
    example: '2024-01-15',
  })
  @IsDate()
  @Type(() => Date)
  ngayChuanBiHang: Date;

  @ApiProperty({
    description: 'Ngày nhận hàng dự kiến',
    type: 'string',
    format: 'date',
    example: '2024-01-17',
  })
  @IsDate()
  @Type(() => Date)
  ngayNhanHang: Date;

  @ApiProperty({
    description: 'Đơn vị vận chuyển',
    example: 'Giao hàng nhanh',
  })
  @IsString()
  donViVanChuyen: string;

  @ApiProperty({
    description: 'Danh sách sản phẩm',
    type: [ChiTietDonHangDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChiTietDonHangDto)
  chiTietDonHangs: ChiTietDonHangDto[];

  @ApiProperty({ description: 'Tên người nhận', example: 'Nguyễn Văn A' })
  @IsString()
  tenNguoiNhan: string;

  @ApiProperty({ description: 'Số điện thoại', example: '0123456789' })
  @IsString()
  sdtNguoiNhan: string;

  @ApiProperty({ description: 'Địa chỉ giao hàng', example: '123 Đường ABC' })
  @IsString()
  diaChiGiaoHang: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}
