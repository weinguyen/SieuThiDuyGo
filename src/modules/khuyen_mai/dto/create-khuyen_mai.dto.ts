import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateKhuyenMaiDto {
  @ApiProperty({
    description: 'Phần trăm giảm (0-100)',
    example: 15.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0, { message: 'Phần trăm giảm không được nhỏ hơn 0' })
  @Max(100, { message: 'Phần trăm giảm không được lớn hơn 100' })
  phanTramGiam: number;

  @ApiProperty({
    description: 'Mô tả khuyến mãi',
    example: 'Giảm giá 20% cho tất cả sản phẩm điện thoại',
    required: false,
  })
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiProperty({
    description: 'Ngày bắt đầu khuyến mãi',
    type: 'string',
    format: 'date',
    example: '2024-01-01',
  })
  @IsDate({ message: 'Ngày bắt đầu phải là định dạng ngày hợp lệ' })
  @Type(() => Date)
  ngayBatDau: Date;

  @ApiProperty({
    description: 'Ngày kết thúc khuyến mãi',
    type: 'string',
    format: 'date',
    example: '2024-01-31',
  })
  @IsDate({ message: 'Ngày kết thúc phải là định dạng ngày hợp lệ' })
  @Type(() => Date)
  ngayKetThuc: Date;

  @ApiProperty({
    description: 'Danh sách ID sản phẩm áp dụng khuyến mãi',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray({ message: 'Danh sách sản phẩm phải là một mảng' })
  @IsNumber({}, { each: true, message: 'Mỗi ID sản phẩm phải là số' })
  @IsNotEmpty({ message: 'Phải chọn ít nhất một sản phẩm' })
  sanPhamIds: number[];
}
