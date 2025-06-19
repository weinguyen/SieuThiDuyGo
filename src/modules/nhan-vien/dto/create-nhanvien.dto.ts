import { ApiProperty, OmitType } from '@nestjs/swagger';

import { NhanVien } from '../entities/nhan-vien.entity';
import { Column } from 'typeorm';
import { IsString } from 'class-validator';

export class CreateNhanVienDto extends OmitType(NhanVien, ['id', 'sanPhams']) {
  @Column({ unique: true })
  @ApiProperty()
  @IsString()
  tenDangNhap: string;
  @Column()
  @ApiProperty()
  @IsString()
  matKhau: string;
}
