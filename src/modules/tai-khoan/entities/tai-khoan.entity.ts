import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { KhachHang } from 'src/modules/khach-hang/entities/khach-hang.entity';
import { NhanVien } from 'src/modules/nhan-vien/entities/nhan-vien.entity';
import { UserRole } from 'src/common/constants/constants';
@Entity('tai_khoan')
export class TaiKhoan {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;
  @Column({ unique: true })
  @ApiProperty()
  @IsString()
  tenDangNhap: string;
  @Column()
  @ApiProperty()
  @IsString()
  matKhau: string;

  @Column()
  @ApiProperty()
  @IsEnum(UserRole)
  loai: UserRole;
  @OneToOne(() => KhachHang, (khachHang) => khachHang.taiKhoan)
  khachHang: KhachHang;
  @OneToOne(() => NhanVien, (nhanVien) => nhanVien.taiKhoan)
  nhanVien: NhanVien;
}
