import { ApiProperty, OmitType } from '@nestjs/swagger';
import { SanPham } from '../entities/san-pham.entity';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { HinhAnhSanPham } from '../entities/hinh-anh.entity';

export class CreateSanPhamDto extends OmitType(SanPham, [
  'id',
  'soLuongDaBan',
  'hinhAnhs',
  'khuyenMais',
]) {
  @ApiProperty({ description: 'ID của danh mục sản phẩm' })
  @IsNumber()
  danhMucId: number;
  @ApiProperty({
    description: 'Danh sách hình ảnh sản phẩm',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  hinhAnhs: string[];
}
