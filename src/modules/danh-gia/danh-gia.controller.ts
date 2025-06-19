import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { DanhGiaService } from './danh-gia.service';
import { CreateDanhGiaDto } from './dto/create-danh-gia.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/constants';
import { CurrentAccount } from '../../common/decorators/account.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Đánh giá')
@ApiBearerAuth()
@Controller('danh-gia')
export class DanhGiaController {
  constructor(private readonly danhGiaService: DanhGiaService) {}

  @Post()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Tạo đánh giá mới (Chỉ khách hàng)' })
  @ApiResponse({ status: 201, description: 'Đánh giá được tạo thành công' })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ hoặc đã đánh giá sản phẩm',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền hoặc chưa mua sản phẩm này',
  })
  create(
    @Body() createDanhGiaDto: CreateDanhGiaDto,
    @CurrentAccount() account: any,
  ) {
    return this.danhGiaService.create(createDanhGiaDto, account.id);
  }

  @Get('san-pham/:sanPhamId')
  @Public()
  @ApiOperation({ summary: 'Lấy đánh giá theo ID sản phẩm' })
  @ApiParam({ name: 'sanPhamId', description: 'ID sản phẩm' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  getBySanPham(@Param('sanPhamId') sanPhamId: string) {
    return this.danhGiaService.getBySanPham(+sanPhamId);
  }

  @Get('khach-hang/:khachHangId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.NHANVIEN, UserRole.KHACHHANG)
  @ApiOperation({ summary: 'Lấy đánh giá theo ID khách hàng' })
  @ApiParam({ name: 'khachHangId', description: 'ID khách hàng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  getByKhachHang(@Param('khachHangId') khachHangId: string) {
    return this.danhGiaService.getByKhachHang(+khachHangId);
  }

  @Get('rating/:sanPhamId')
  @Public()
  @ApiOperation({ summary: 'Lấy thông tin đánh giá trung bình của sản phẩm' })
  @ApiParam({ name: 'sanPhamId', description: 'ID sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin đánh giá thành công',
  })
  getSanPhamRating(@Param('sanPhamId') sanPhamId: string) {
    return this.danhGiaService.getSanPhamRating(+sanPhamId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Lấy thông tin chi tiết đánh giá theo ID' })
  @ApiParam({ name: 'id', description: 'ID đánh giá' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đánh giá' })
  findOne(@Param('id') id: string) {
    return this.danhGiaService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.NHANVIEN, UserRole.KHACHHANG)
  @ApiOperation({ summary: 'Xóa đánh giá' })
  @ApiParam({ name: 'id', description: 'ID đánh giá cần xóa' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đánh giá' })
  remove(@Param('id') id: string, @CurrentAccount() account: any) {
    return this.danhGiaService.remove(+id, account);
  }
}
