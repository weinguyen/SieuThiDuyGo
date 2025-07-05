import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { TaiKhoan } from 'src/modules/tai-khoan/entities/tai-khoan.entity';
import { DonHang } from 'src/modules/don-hang/entities/don-hang.entity';
import { ThongTinLienHe } from 'src/modules/thong-tin-lien-he/entities/thong-tin-lien-he.entity';
import { DanhGia } from 'src/modules/danh-gia/entities/danh-gia.entity';

@Entity('khach_hang')
export class KhachHang {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;
  @Column({ length: 100 })
  @ApiProperty()
  @IsString()
  tenKhachHang: string;

  @Column()
  @ApiProperty()
  @IsString()
  sdt: string;
  @OneToOne(() => TaiKhoan, (taiKhoan) => taiKhoan.khachHang, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  taiKhoan: TaiKhoan;
  taiKhoanId: number;
  @OneToMany(() => DonHang, (donHang) => donHang.khachHang)
  donHangs: DonHang[];
  @OneToMany(() => ThongTinLienHe, (thongTinLienHe) => thongTinLienHe.khachHang)
  thongTinLienHe: ThongTinLienHe[];
  @OneToMany(() => DanhGia, (danhGia) => danhGia.khachHang)
  danhGias: DanhGia[];
}
