import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TaiKhoanService } from './tai-khoan.service';
import { UpdateTaiKhoanDto } from './dto/update-tai-khoan.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('taikhoan')
export class TaiKhoanController {
  constructor(private readonly taiKhoanService: TaiKhoanService) {}
  @Public()
  @Get()
  findAll() {
    return this.taiKhoanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taiKhoanService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaiKhoanDto: UpdateTaiKhoanDto,
  ) {
    return this.taiKhoanService.update(+id, updateTaiKhoanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taiKhoanService.remove(+id);
  }
}
