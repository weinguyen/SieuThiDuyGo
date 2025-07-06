import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SanPham } from '../../san-pham/entities/san-pham.entity';
import { NhanVien } from '../../nhan-vien/entities/nhan-vien.entity';

export enum LoaiGiaoDich {
  NHAP_KHO = 'nhap_kho',
  XUAT_KHO = 'xuat_kho',
  DIEU_CHINH = 'dieu_chinh',
  TRA_HANG = 'tra_hang',
  HUY_HANG = 'huy_hang',
}

@Entity('lich_su_kho_hang')
export class LichSuKhoHang {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Mã lịch sử (PK)' })
  id: number;

  @Column()
  @ApiProperty({ description: 'Mã sản phẩm (FK)' })
  @IsNumber()
  sanPhamId: number;

  @Column()
  @ApiProperty({
    description: 'Loại giao dịch',
    enum: LoaiGiaoDich,
    example: LoaiGiaoDich.NHAP_KHO,
  })
  @IsEnum(LoaiGiaoDich)
  loaiGiaoDich: LoaiGiaoDich;

  @Column()
  @ApiProperty({ description: 'Số lượng thay đổi' })
  @IsNumber()
  soLuongThayDoi: number;
  @Column()
  @ApiProperty({
    description: 'Tồn kho sau khi thực hiện giao dịch',
    example: 150,
  })
  @IsNumber()
  tonKhoSauCung: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'Ngày thực hiện' })
  ngayThucHien: Date;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Mã nhân viên (FK) - người thực hiện',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  nhanVienId?: number;

  @ManyToOne(() => SanPham, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sanPhamId' })
  sanPham: SanPham;

  @ManyToOne(() => NhanVien, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'nhanVienId' })
  nhanVien?: NhanVien;
}
