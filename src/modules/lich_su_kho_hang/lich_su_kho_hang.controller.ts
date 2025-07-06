import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { LichSuKhoHangService } from './lich_su_kho_hang.service';
import { CreateLichSuKhoHangDto } from './dto/create-lich_su_kho_hang.dto';
import { LichSuKhoHang } from './entities/lich_su_kho_hang.entity';
import { CurrentAccount } from 'src/common/decorators/account.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/constants/constants';

@ApiTags('Lịch sử kho hàng')
@Controller('lich-su-kho-hang')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.NHANVIEN)
export class LichSuKhoHangController {
  constructor(private readonly lichSuKhoHangService: LichSuKhoHangService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo giao dịch kho mới',
    description: 'Ghi lại giao dịch nhập/xuất/điều chỉnh kho hàng',
  })
  @ApiResponse({
    status: 201,
    description: 'Giao dịch kho được tạo thành công',
    type: LichSuKhoHang,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc không đủ hàng',
  })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  create(
    @Body() createLichSuKhoHangDto: CreateLichSuKhoHangDto,
    @CurrentAccount() account: any,
  ): Promise<LichSuKhoHang> {
    return this.lichSuKhoHangService.create(createLichSuKhoHangDto, account);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy tất cả lịch sử kho',
    description: 'Trả về danh sách tất cả giao dịch kho',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lịch sử kho',
    type: [LichSuKhoHang],
  })
  findAll(): Promise<LichSuKhoHang[]> {
    return this.lichSuKhoHangService.findAll();
  }

  @Get('san-pham/:id')
  @ApiOperation({
    summary: 'Lấy lịch sử kho theo sản phẩm',
    description: 'Trả về lịch sử nhập/xuất kho của một sản phẩm cụ thể',
  })
  @ApiParam({ name: 'id', description: 'ID sản phẩm', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử kho của sản phẩm',
    type: [LichSuKhoHang],
  })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  findBySanPham(@Param('id') id: string): Promise<LichSuKhoHang[]> {
    return this.lichSuKhoHangService.findBySanPham(+id);
  }

  @Get('bao-cao/thong-ke')
  @ApiOperation({
    summary: 'Thống kê kho hàng',
    description: 'Báo cáo thống kê giao dịch kho theo thời gian',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Ngày kết thúc (YYYY-MM-DD)',
    required: false,
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Báo cáo thống kê kho hàng' })
  async getThongKeKho(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate);
    }
    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    return this.lichSuKhoHangService.getThongKeKho(start, end);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết giao dịch kho',
    description: 'Trả về thông tin chi tiết của một giao dịch kho',
  })
  @ApiParam({ name: 'id', description: 'ID giao dịch kho', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết giao dịch kho',
    type: LichSuKhoHang,
  })
  @ApiResponse({ status: 404, description: 'Giao dịch kho không tồn tại' })
  findOne(@Param('id') id: string): Promise<LichSuKhoHang> {
    return this.lichSuKhoHangService.findOne(+id);
  }
}
