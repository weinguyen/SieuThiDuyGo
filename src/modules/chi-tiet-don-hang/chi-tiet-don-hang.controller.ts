import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChiTietDonHangService } from './chi-tiet-don-hang.service';
import { CreateChiTietDonHangDto } from './dto/create-chi-tiet-don-hang.dto';
import { UpdateChiTietDonHangDto } from './dto/update-chi-tiet-don-hang.dto';

@Controller('chi-tiet-don-hang')
export class ChiTietDonHangController {
  constructor(private readonly chiTietDonHangService: ChiTietDonHangService) {}

  @Post()
  create(@Body() createChiTietDonHangDto: CreateChiTietDonHangDto) {
    return this.chiTietDonHangService.create(createChiTietDonHangDto);
  }

  @Get()
  findAll() {
    return this.chiTietDonHangService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chiTietDonHangService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChiTietDonHangDto: UpdateChiTietDonHangDto,
  ) {
    return this.chiTietDonHangService.update(+id, updateChiTietDonHangDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chiTietDonHangService.remove(+id);
  }
}
