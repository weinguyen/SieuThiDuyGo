import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { TaiKhoan } from 'src/modules/tai-khoan/entities/tai-khoan.entity';
import { DonHang } from 'src/modules/don-hang/entities/don-hang.entity';
import { KhachHang } from 'src/modules/khach-hang/entities/khach-hang.entity';

@Entity('thong_tin_lien_he')
export class ThongTinLienHe {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;
  @Column({ length: 100 })
  @ApiProperty()
  @IsString()
  tenNguoiNhan: string;
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
  ghiChu: string;
  @ManyToOne(() => KhachHang, (khachHang) => khachHang.thongTinLienHe, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  khachHang: KhachHang;
  @OneToMany(() => DonHang, (donHang) => donHang.thongTinLienHe)
  donHang: DonHang[];
}
