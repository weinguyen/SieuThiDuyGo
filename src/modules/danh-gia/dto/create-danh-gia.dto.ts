import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateDanhGiaDto {
  @ApiProperty({
    description: 'Số sao đánh giá (1-5)',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  soSao: number;

  @ApiProperty({
    description: 'Nội dung đánh giá',
    example: 'Sản phẩm rất tốt, giao hàng nhanh chóng!',
  })
  @IsString()
  @IsNotEmpty()
  noiDung: string;

  @ApiProperty({ description: 'ID sản phẩm được đánh giá', example: 1 })
  @IsNumber()
  sanPhamId: number;
}
