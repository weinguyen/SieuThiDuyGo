import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { IsNumber, IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NhanVien } from '../../nhan-vien/entities/nhan-vien.entity';
import { DanhMuc } from '../../danh-muc/entities/danh-muc.entity';
import { DanhGia } from '../../danh-gia/entities/danh-gia.entity';
import { HinhAnhSanPham } from './hinh-anh.entity';
import { ChiTietDonHang } from '../../chi-tiet-don-hang/entities/chi-tiet-don-hang.entity';
import { KhuyenMai } from 'src/modules/khuyen_mai/entities/khuyen_mai.entity';

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

  @ManyToOne(() => NhanVien, (nhanVien) => nhanVien.sanPhams, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'nhanVienId' })
  nhanVien: NhanVien;

  @ManyToOne(() => DanhMuc, (danhMuc) => danhMuc.sanPhams, {
    onDelete: 'SET NULL',
    nullable: true,
  })
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
  @ManyToMany(() => KhuyenMai, (khuyenMai) => khuyenMai.sanPhams)
  @ApiProperty({
    type: () => [KhuyenMai],
    description: 'Danh sách khuyến mãi áp dụng',
  })
  khuyenMais: KhuyenMai[];
}
