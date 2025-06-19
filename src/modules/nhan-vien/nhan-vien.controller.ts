import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NhanVienService } from './nhan-vien.service';
import { CreateNhanVienDto } from './dto/create-nhanvien.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('nhan-vien')
export class NhanVienController {
  constructor(private readonly nhanVienService: NhanVienService) {}

  @Post()
  create(@Body() createNhanVienDto: CreateNhanVienDto) {
    return this.nhanVienService.create(createNhanVienDto);
  }

  @Get()
  findAll() {
    return this.nhanVienService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nhanVienService.findOne(+id);
  }
}
