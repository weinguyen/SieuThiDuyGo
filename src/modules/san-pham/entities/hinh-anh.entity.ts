import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { SanPham } from './san-pham.entity';

@Entity('hinh_anh_san_pham')
export class HinhAnhSanPham {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  @IsString()
  hinhAnh: string;

  @ManyToOne(() => SanPham, (sanPham) => sanPham.hinhAnhs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sanPhamId' })
  sanPham: SanPham;
}
