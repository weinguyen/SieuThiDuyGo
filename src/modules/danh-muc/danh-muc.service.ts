import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: number): Promise<DanhMuc> {
    const danhMuc = await this.danhMucRepository.findOne({
      where: { id },
      relations: ['sanPhams'],
    });

    if (!danhMuc) {
      throw new NotFoundException(`Danh mục với ID ${id} không tồn tại`);
    }

    return danhMuc;
  }

  async update(id: number, updateDanhMucDto: UpdateDanhMucDto) {
    return await this.danhMucRepository.update(id, updateDanhMucDto);
  }

  async remove(id: number) {
    await this.danhMucRepository.delete(id);
    return { message: `Danh mục với ID ${id} đã được xóa thành công` };
  }
}
