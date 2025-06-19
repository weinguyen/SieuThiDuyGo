import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNhanVienDto } from './dto/create-nhanvien.dto';
import { NhanVien } from './entities/nhan-vien.entity';
import { TaiKhoan } from '../tai-khoan/entities/tai-khoan.entity';
import { UserRole } from 'src/common/constants/constants';

@Injectable()
export class NhanVienService {
  constructor(
    @InjectRepository(NhanVien)
    private readonly nhanVienRepository: Repository<NhanVien>,
  ) {}

  async create(createNhanVienDto: CreateNhanVienDto): Promise<NhanVien> {
    const taikhoan = new TaiKhoan();
    taikhoan.tenDangNhap = createNhanVienDto.tenDangNhap;
    taikhoan.matKhau = createNhanVienDto.matKhau;
    taikhoan.loai = UserRole.NHANVIEN;
    const nhanVien = this.nhanVienRepository.create({
      ...createNhanVienDto,
      taiKhoan: taikhoan,
    });

    return await this.nhanVienRepository.save(nhanVien);
  }

  async findAll(): Promise<NhanVien[]> {
    return await this.nhanVienRepository.find();
  }

  async findOne(id: number): Promise<NhanVien | null> {
    return await this.nhanVienRepository.findOne({
      where: { id },
    });
  }
}
