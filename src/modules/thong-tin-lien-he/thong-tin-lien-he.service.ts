import { Injectable } from '@nestjs/common';
import { CreateThongTinLienHeDto } from './dto/create-thong-tin-lien-he.dto';
import { UpdateThongTinLienHeDto } from './dto/update-thong-tin-lien-he.dto';

@Injectable()
export class ThongTinLienHeService {
  create(createThongTinLienHeDto: CreateThongTinLienHeDto) {
    return 'This action adds a new thongTinLienHe';
  }

  findAll() {
    return `This action returns all thongTinLienHe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} thongTinLienHe`;
  }

  update(id: number, updateThongTinLienHeDto: UpdateThongTinLienHeDto) {
    return `This action updates a #${id} thongTinLienHe`;
  }

  remove(id: number) {
    return `This action removes a #${id} thongTinLienHe`;
  }
}
