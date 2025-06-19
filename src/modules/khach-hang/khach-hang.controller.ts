import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { KhachHangService } from './khach-hang.service';
import { CreateKhachHangDto } from './dto/create-khachhang.dto';
import { UpdateKhachHangDto } from './dto/update-khachhang.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiBearerAuth()
@Controller('khach-hang')
export class KhachHangController {
  constructor(private readonly khachHangService: KhachHangService) {}
  @ApiOperation({ summary: 'Đăng ký khách hàng' })
  @Public()
  @Post()
  register(@Body() createKhachHangDto: CreateKhachHangDto) {
    return this.khachHangService.create(createKhachHangDto);
  }

  @Get()
  findAll() {
    return this.khachHangService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.khachHangService.findOne(+id);
  }

  update(
    @Param('id') id: string,
    @Body() updateKhachHangDto: UpdateKhachHangDto,
  ) {
    return this.khachHangService.update(+id, updateKhachHangDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.khachHangService.remove(+id);
  }
}
