import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { KhachHang } from '../../khach-hang/entities/khach-hang.entity';
import { SanPham } from '../../san-pham/entities/san-pham.entity';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

@Entity('danh_gia')
export class DanhGia {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID đánh giá' })
  id: number;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'Số sao đánh giá (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  soSao: number;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Nội dung đánh giá' })
  @IsString()
  @IsNotEmpty()
  noiDung: string;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Ngày đánh giá' })
  ngayDanhGia: Date;

  @ManyToOne(() => KhachHang, (khachHang) => khachHang.danhGias)
  @JoinColumn({ name: 'khachHangId' })
  @ApiProperty({ description: 'Khách hàng đánh giá' })
  khachHang: KhachHang;

  @Column()
  @ApiProperty({ description: 'ID khách hàng' })
  khachHangId: number;

  @ManyToOne(() => SanPham, (sanPham) => sanPham.danhGias)
  @JoinColumn({ name: 'sanPhamId' })
  @ApiProperty({ description: 'Sản phẩm được đánh giá' })
  sanPham: SanPham;

  @Column()
  @ApiProperty({ description: 'ID sản phẩm' })
  sanPhamId: number;
}
