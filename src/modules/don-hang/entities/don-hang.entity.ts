import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { KhachHang } from '../../khach-hang/entities/khach-hang.entity';
import { ChiTietDonHang } from '../../chi-tiet-don-hang/entities/chi-tiet-don-hang.entity';
import { ThongTinLienHe } from 'src/modules/thong-tin-lien-he/entities/thong-tin-lien-he.entity';
import { on } from 'events';

@Entity('don_hang')
export class DonHang {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  @IsString()
  tenDonHang: string;

  @Column()
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  ngayChuanBiHang: Date;

  @Column()
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  ngayNhanHang: Date;

  @Column()
  @ApiProperty()
  @IsString()
  donViVanChuyen: string;

  @Column()
  @ApiProperty()
  @IsString()
  phuongThucThanhToan: string;
  @Column()
  @ApiProperty()
  @IsString()
  trangThaiDonHang: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  @IsNumber()
  tongTien: number;

  @ManyToOne(() => KhachHang, (khachHang) => khachHang.donHangs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'khachHangId' })
  khachHang: KhachHang;
  @OneToMany(() => ChiTietDonHang, (chiTietDonHang) => chiTietDonHang.donHang, {
    cascade: true,
  })
  chiTietDonHangs: ChiTietDonHang[];
  @ManyToOne(() => ThongTinLienHe, (thongTinLienHe) => thongTinLienHe.donHang, {
    cascade: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  thongTinLienHe: ThongTinLienHe;
}
