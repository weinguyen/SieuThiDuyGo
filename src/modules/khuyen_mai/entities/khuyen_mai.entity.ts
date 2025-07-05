import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, Min, Max } from 'class-validator';
import { SanPham } from '../../san-pham/entities/san-pham.entity';

@Entity('khuyen_mai')
export class KhuyenMai {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Mã khuyến mãi (Primary Key)' })
  id: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @ApiProperty({
    description: 'Phần trăm giảm (0-100)',
    example: 15.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  phanTramGiam: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'Mô tả khuyến mãi',
    example: 'Giảm giá 20% cho tất cả sản phẩm điện thoại',
  })
  @IsString()
  moTa?: string;

  @Column({ type: 'date' })
  @ApiProperty({
    description: 'Ngày bắt đầu khuyến mãi',
    type: 'string',
    format: 'date',
    example: '2024-01-01',
  })
  @IsDate()
  ngayBatDau: Date;

  @Column({ type: 'date' })
  @ApiProperty({
    description: 'Ngày kết thúc khuyến mãi',
    type: 'string',
    format: 'date',
    example: '2024-01-31',
  })
  @IsDate()
  ngayKetThuc: Date;

  @ManyToMany(() => SanPham, (sanPham) => sanPham.khuyenMais)
  @JoinTable({
    name: 'khuyenmai_sanpham',
    joinColumn: {
      name: 'khuyenMaiId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'sanPhamId',
      referencedColumnName: 'id',
    },
  })
  sanPhams: SanPham[];

  @CreateDateColumn()
  @ApiProperty({ description: 'Ngày tạo bản ghi' })
  ngayTao: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Ngày cập nhật cuối' })
  ngayCapNhat: Date;
}
