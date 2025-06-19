import { Injectable } from '@nestjs/common';
import { CreateDanhMucDto } from './dto/create-danh_muc.dto';
import { UpdateDanhMucDto } from './dto/update-danh_muc.dto';
import { DanhMuc } from './entities/danh-muc.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DanhMucService {
  constructor(
    @InjectRepository(DanhMuc)
    private readonly danhMucRepository: Repository<DanhMuc>,
  ) {}
  async create(createDanhMucDto: CreateDanhMucDto) {
    const existingDanhMuc = await this.danhMucRepository.findOneBy({
      tenDanhMuc: createDanhMucDto.tenDanhMuc,
    });
    if (existingDanhMuc) return 'Tên danh mục đã tồn tại';
    return await this.danhMucRepository.save(createDanhMucDto);
  }

  async findAll(): Promise<DanhMuc[]> {
    return await this.danhMucRepository.find();
  }

  findOne(ten: string) {
    return `This action returns a #${ten} danhMuc`;
  }

  update(id: number, updateDanhMucDto: UpdateDanhMucDto) {
    return `This action updates a #${id} danhMuc`;
  }

  remove(id: number) {
    return `This action removes a #${id} danhMuc`;
  }
}
