import { Injectable } from '@nestjs/common';
import { CreateLichSuKhoHangDto } from './dto/create-lich_su_kho_hang.dto';
import { UpdateLichSuKhoHangDto } from './dto/update-lich_su_kho_hang.dto';

@Injectable()
export class LichSuKhoHangService {
  create(createLichSuKhoHangDto: CreateLichSuKhoHangDto) {
    return 'This action adds a new lichSuKhoHang';
  }

  findAll() {
    return `This action returns all lichSuKhoHang`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lichSuKhoHang`;
  }

  update(id: number, updateLichSuKhoHangDto: UpdateLichSuKhoHangDto) {
    return `This action updates a #${id} lichSuKhoHang`;
  }

  remove(id: number) {
    return `This action removes a #${id} lichSuKhoHang`;
  }
}
