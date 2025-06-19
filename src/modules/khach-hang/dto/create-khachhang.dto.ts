import { ApiProperty, OmitType } from '@nestjs/swagger';
import { KhachHang } from '../entities/khach-hang.entity';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Column } from 'typeorm';

export class CreateKhachHangDto extends OmitType(KhachHang, ['id']) {
  @Column({ unique: true })
  @ApiProperty()
  @IsString()
  tenDangNhap: string;
  @Column()
  @ApiProperty()
  @IsString()
  matKhau: string;
}
