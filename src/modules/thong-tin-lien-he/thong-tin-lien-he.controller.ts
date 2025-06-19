import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ThongTinLienHeService } from './thong-tin-lien-he.service';
import { CreateThongTinLienHeDto } from './dto/create-thong-tin-lien-he.dto';
import { UpdateThongTinLienHeDto } from './dto/update-thong-tin-lien-he.dto';

@Controller('thong-tin-lien-he')
export class ThongTinLienHeController {
  constructor(private readonly thongTinLienHeService: ThongTinLienHeService) {}

  @Post()
  create(@Body() createThongTinLienHeDto: CreateThongTinLienHeDto) {
    return this.thongTinLienHeService.create(createThongTinLienHeDto);
  }

  @Get()
  findAll() {
    return this.thongTinLienHeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.thongTinLienHeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateThongTinLienHeDto: UpdateThongTinLienHeDto,
  ) {
    return this.thongTinLienHeService.update(+id, updateThongTinLienHeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.thongTinLienHeService.remove(+id);
  }
}
