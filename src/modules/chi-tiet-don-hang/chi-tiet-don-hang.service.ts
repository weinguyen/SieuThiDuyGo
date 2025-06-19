import { Injectable } from '@nestjs/common';
import { CreateChiTietDonHangDto } from './dto/create-chi-tiet-don-hang.dto';
import { UpdateChiTietDonHangDto } from './dto/update-chi-tiet-don-hang.dto';

@Injectable()
export class ChiTietDonHangService {
  create(createChiTietDonHangDto: CreateChiTietDonHangDto) {
    return 'This action adds a new chiTietDonHang';
  }

  findAll() {
    return `This action returns all chiTietDonHang`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chiTietDonHang`;
  }

  update(id: number, updateChiTietDonHangDto: UpdateChiTietDonHangDto) {
    return `This action updates a #${id} chiTietDonHang`;
  }

  remove(id: number) {
    return `This action removes a #${id} chiTietDonHang`;
  }
}
