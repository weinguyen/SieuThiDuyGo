import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { SanPham } from 'src/modules/san-pham/entities/san-pham.entity';

@Entity('danh_muc')
export class DanhMuc {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tên danh mục' })
  @IsString()
  tenDanhMuc: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Mô tả danh mục', required: true })
  @IsString()
  moTa: string;
  @OneToMany(() => SanPham, (sanPham) => sanPham.danhMuc)
  sanPhams: SanPham[];
}
