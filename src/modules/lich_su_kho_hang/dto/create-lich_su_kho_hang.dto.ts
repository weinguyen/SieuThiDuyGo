import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { LoaiGiaoDich } from '../entities/lich_su_kho_hang.entity';

export class CreateLichSuKhoHangDto {
  @ApiProperty({
    description: 'Mã sản phẩm',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  sanPhamId: number;

  @ApiProperty({
    description: 'Loại giao dịch',
    enum: LoaiGiaoDich,
    example: LoaiGiaoDich.NHAP_KHO,
  })
  @IsEnum(LoaiGiaoDich)
  loaiGiaoDich: LoaiGiaoDich;

  @ApiProperty({
    description: 'Số lượng thay đổi',
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  soLuongThayDoi: number;
}
