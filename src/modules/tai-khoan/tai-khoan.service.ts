import { Injectable } from '@nestjs/common';
import { CreateTaiKhoanDto } from './dto/create-tai-khoan.dto';
import { UpdateTaiKhoanDto } from './dto/update-tai-khoan.dto';
import { TaiKhoan } from './entities/tai-khoan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from 'src/common/constants/constants';

@Injectable()
export class TaiKhoanService {
  constructor(
    @InjectRepository(TaiKhoan)
    private readonly taiKhoanRepository: Repository<TaiKhoan>,
  ) {}
  createKhachHang(createTaiKhoanDto: CreateTaiKhoanDto) {
    const taiKhoan = this.taiKhoanRepository.create({
      ...createTaiKhoanDto,
      loai: UserRole.KHACHHANG,
    });
    return this.taiKhoanRepository.save(taiKhoan);
  }
  createNhanVien(createTaiKhoanDto: CreateTaiKhoanDto) {
    const taiKhoan = this.taiKhoanRepository.create({
      ...createTaiKhoanDto,
      loai: UserRole.NHANVIEN,
    });
    return this.taiKhoanRepository.save(taiKhoan);
  }
  findAll() {
    return this.taiKhoanRepository.find();
  }

  findOne(id: number) {
    return this.taiKhoanRepository.findOne({ where: { id } });
  }

  update(id: number, updateTaiKhoanDto: UpdateTaiKhoanDto) {
    return this.taiKhoanRepository.update(id, updateTaiKhoanDto);
  }

  remove(id: number) {
    return this.taiKhoanRepository.delete(id);
  }
  findOneByUsername(username: string) {
    return this.taiKhoanRepository.findOne({
      where: { tenDangNhap: username },
    });
  }
}
