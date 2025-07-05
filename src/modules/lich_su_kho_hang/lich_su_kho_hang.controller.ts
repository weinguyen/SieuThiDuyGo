import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LichSuKhoHangService } from './lich_su_kho_hang.service';
import { CreateLichSuKhoHangDto } from './dto/create-lich_su_kho_hang.dto';
import { UpdateLichSuKhoHangDto } from './dto/update-lich_su_kho_hang.dto';

@Controller('lich-su-kho-hang')
export class LichSuKhoHangController {
  constructor(private readonly lichSuKhoHangService: LichSuKhoHangService) {}

  @Post()
  create(@Body() createLichSuKhoHangDto: CreateLichSuKhoHangDto) {
    return this.lichSuKhoHangService.create(createLichSuKhoHangDto);
  }

  @Get()
  findAll() {
    return this.lichSuKhoHangService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lichSuKhoHangService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLichSuKhoHangDto: UpdateLichSuKhoHangDto) {
    return this.lichSuKhoHangService.update(+id, updateLichSuKhoHangDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lichSuKhoHangService.remove(+id);
  }
}
