import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SanPhamService } from './san-pham.service';
import { CreateSanPhamDto } from './dto/create-sanpham.dto';
import { UpdateSanPhamDto } from './dto/update-sanpham.dto';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/constants/constants';
import { CurrentAccount } from 'src/common/decorators/account.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Sản phẩm')
@Controller('san-pham')
@ApiBearerAuth()
export class SanPhamController {
  constructor(private readonly sanPhamService: SanPhamService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo sản phẩm mới',
    description: 'Tạo một sản phẩm mới với thông tin đầy đủ bao gồm hình ảnh',
  })
  @ApiResponse({ status: 201, description: 'Sản phẩm được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({
    status: 404,
    description: 'Nhân viên hoặc danh mục không tồn tại',
  })
  create(
    @Body() createSanPhamDto: CreateSanPhamDto,
    @CurrentAccount() account: any,
  ) {
    return this.sanPhamService.create(createSanPhamDto, account);
  }
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lấy tất cả sản phẩm',
    description: 'Trả về danh sách tất cả sản phẩm với thông tin chi tiết',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách sản phẩm thành công',
  })
  findAll() {
    return this.sanPhamService.findAll();
  }

  @Get('page/:stt')
  @ApiOperation({
    summary: 'Lấy sản phẩm theo trang',
    description: 'Phân trang danh sách sản phẩm, mỗi trang 20 sản phẩm',
  })
  @ApiParam({ name: 'stt', description: 'Số trang (bắt đầu từ 1)', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Lấy sản phẩm theo trang thành công',
  })
  findByPage(@Param('stt') stt: string) {
    return this.sanPhamService.findByPage(+stt);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Tìm kiếm sản phẩm theo tên',
    description: 'Tìm kiếm sản phẩm dựa trên tên sản phẩm',
  })
  @ApiQuery({
    name: 'ten',
    description: 'Tên sản phẩm cần tìm',
    example: 'iPhone',
  })
  @ApiResponse({ status: 200, description: 'Tìm kiếm thành công' })
  findByName(@Query('ten') ten: string) {
    return this.sanPhamService.findByName(ten);
  }
  @Public()
  @Get('danh-muc/:danhMucId')
  @ApiOperation({
    summary: 'Lấy sản phẩm theo danh mục',
    description: 'Trả về danh sách sản phẩm thuộc một danh mục cụ thể',
  })
  @ApiParam({ name: 'danhMucId', description: 'ID danh mục', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Lấy sản phẩm theo danh mục thành công',
  })
  findByDanhMuc(@Param('danhMucId') danhMucId: string) {
    return this.sanPhamService.findByDanhMuc(+danhMucId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết sản phẩm',
    description:
      'Trả về thông tin chi tiết của một sản phẩm bao gồm hình ảnh và đánh giá',
  })
  @ApiParam({ name: 'id', description: 'ID sản phẩm', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin sản phẩm thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  findOne(@Param('id') id: string) {
    return this.sanPhamService.findOne(+id);
  }

  @Roles(UserRole.ADMIN, UserRole.NHANVIEN)
  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa sản phẩm',
    description: 'Xóa sản phẩm khỏi hệ thống',
  })
  @ApiParam({ name: 'id', description: 'ID sản phẩm cần xóa', example: 1 })
  @ApiResponse({ status: 200, description: 'Xóa sản phẩm thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  remove(@Param('id') id: string) {
    return this.sanPhamService.remove(+id);
  }
}
