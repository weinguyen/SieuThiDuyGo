import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { KhuyenMaiService } from './khuyen_mai.service';
import { CreateKhuyenMaiDto } from './dto/create-khuyen_mai.dto';
import { UpdateKhuyenMaiDto } from './dto/update-khuyen_mai.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('khuyen-mai')
export class KhuyenMaiController {
  constructor(private readonly khuyenMaiService: KhuyenMaiService) {}

  @Post()
  create(@Body() createKhuyenMaiDto: CreateKhuyenMaiDto) {
    return this.khuyenMaiService.create(createKhuyenMaiDto);
  }

  @Get()
  findAll() {
    return this.khuyenMaiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.khuyenMaiService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateKhuyenMaiDto: UpdateKhuyenMaiDto,
  ) {
    return this.khuyenMaiService.update(+id, updateKhuyenMaiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.khuyenMaiService.remove(+id);
  }
}
