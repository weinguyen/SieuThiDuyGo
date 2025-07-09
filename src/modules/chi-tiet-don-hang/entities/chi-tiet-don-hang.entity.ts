import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { SanPham } from '../../san-pham/entities/san-pham.entity';
import { DonHang } from '../../don-hang/entities/don-hang.entity';

@Entity('chi_tiet_don_hang')
export class ChiTietDonHang {
  @PrimaryColumn()
  @ApiProperty()
  @IsNumber()
  maDonHang: number;

  @PrimaryColumn()
  @ApiProperty()
  @IsNumber()
  maSanPham: number;

  @Column()
  @ApiProperty()
  @IsNumber()
  donGia: number;

  @Column()
  @ApiProperty()
  @IsNumber()
  soLuong: number;

  @Column()
  @ApiProperty()
  @IsNumber()
  thanhTien: number;

  @ManyToOne(() => DonHang, (donHang) => donHang.chiTietDonHangs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maDonHang' })
  donHang: DonHang;

  @ManyToOne(() => SanPham, (sanPham) => sanPham.chiTietDonHangs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maSanPham' })
  sanPham: SanPham;
}
