import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 1 })
  @IsNumber()
  sanPhamId: number;

  @ApiProperty({ description: 'Số lượng', example: 2, minimum: 1 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  soLuong: number;
}
