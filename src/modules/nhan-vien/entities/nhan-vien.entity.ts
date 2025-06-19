import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { SanPham } from '../../san-pham/entities/san-pham.entity';
import { TaiKhoan } from '../../tai-khoan/entities/tai-khoan.entity';

@Entity('nhan_vien')
export class NhanVien {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  @IsString()
  tenNhanVien: string;

  @Column()
  @ApiProperty()
  @IsString()
  sdt: string;

  @Column()
  @ApiProperty()
  @IsString()
  diaChi: string;

  @Column()
  @ApiProperty()
  @IsString()
  vaiTro: string;
  @OneToOne(() => TaiKhoan, (taiKhoan) => taiKhoan.nhanVien, {
    cascade: true,
  })
  @JoinColumn({ name: 'taiKhoanId' })
  taiKhoan: TaiKhoan;

  @OneToMany(() => SanPham, (sanPham) => sanPham.nhanVien)
  sanPhams: SanPham[];
}
