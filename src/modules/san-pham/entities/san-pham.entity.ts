import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsNumber, IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NhanVien } from '../../nhan-vien/entities/nhan-vien.entity';
import { DanhMuc } from '../../danh-muc/entities/danh-muc.entity';
import { DanhGia } from '../../danh-gia/entities/danh-gia.entity';
import { HinhAnhSanPham } from './hinh-anh.entity';
import { ChiTietDonHang } from '../../chi-tiet-don-hang/entities/chi-tiet-don-hang.entity';

@Entity('san_pham')
export class SanPham {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  @IsString()
  ten: string;

  @Column({ default: 0 })
  @ApiProperty()
  @IsNumber()
  soLuongDaBan: number;

  @Column()
  @ApiProperty()
  @IsNumber()
  soLuongHienCon: number;

  @Column()
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  hanSuDung: Date;

  @Column()
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  ngaySanXuat: Date;

  @Column({ type: 'text' })
  @ApiProperty()
  @IsString()
  moTa: string;

  @Column()
  @ApiProperty()
  @IsNumber()
  gia: number;

  @ManyToOne(() => NhanVien, (nhanVien) => nhanVien.sanPhams)
  @JoinColumn({ name: 'nhanVienId' })
  nhanVien: NhanVien;

  @ManyToOne(() => DanhMuc, (danhMuc) => danhMuc.sanPhams)
  @JoinColumn({ name: 'danhMucId' })
  danhMuc: DanhMuc;

  @OneToMany(() => DanhGia, (danhGia) => danhGia.sanPham)
  danhGias: DanhGia[];

  @OneToMany(() => HinhAnhSanPham, (hinhAnh) => hinhAnh.sanPham, {
    cascade: true,
  })
  hinhAnhs: HinhAnhSanPham[];
  @OneToMany(() => ChiTietDonHang, (chiTiet) => chiTiet.sanPham, {
    cascade: true,
  })
  chiTietDonHangs: ChiTietDonHang[];
}
