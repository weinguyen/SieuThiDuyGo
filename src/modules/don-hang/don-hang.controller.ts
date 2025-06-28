import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DonHangService } from './don-hang.service';
import { RolesGuard } from 'src/common/guards/role.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UserRole } from 'src/common/constants/constants';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentAccount } from 'src/common/decorators/account.decorator';
import { AddToCartDto } from './dto/addtocard.dto';
import { CheckoutCartDto } from './dto/checkoutcard.dto';
@ApiBearerAuth()
@Controller('don-hang')
export class DonHangController {
  constructor(private readonly donHangService: DonHangService) {}

  @Post('cart/add')
  @UseGuards(RolesGuard)
  @Roles(UserRole.KHACHHANG)
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng (Khách hàng)' })
  @ApiResponse({ status: 201, description: 'Thêm vào giỏ hàng thành công' })
  @ApiResponse({
    status: 400,
    description: 'Sản phẩm không tồn tại hoặc không đủ số lượng',
  })
  @ApiResponse({
    status: 403,
    description: 'Chỉ khách hàng mới có quyền thêm vào giỏ hàng',
  })
  addToCart(
    @Body() addToCartDto: AddToCartDto,
    @CurrentAccount() account: any,
  ) {
    return this.donHangService.addToCart(account.id, addToCartDto);
  }

  @Get('cart')
  @UseGuards(RolesGuard)
  @Roles(UserRole.KHACHHANG)
  @ApiOperation({ summary: 'Xem giỏ hàng (Khách hàng)' })
  @ApiResponse({ status: 200, description: 'Lấy giỏ hàng thành công' })
  @ApiResponse({
    status: 403,
    description: 'Chỉ khách hàng mới có quyền xem giỏ hàng',
  })
  getCart(@CurrentAccount() account: any) {
    return this.donHangService.getCart(account.id);
  }

  @Patch('cart/update/:maSanPham/:soLuong')
  @UseGuards(RolesGuard)
  @Roles(UserRole.KHACHHANG)
  @ApiOperation({
    summary: 'Cập nhật số lượng sản phẩm trong giỏ hàng (Khách hàng)',
  })
  @ApiParam({ name: 'maSanPham', description: 'ID sản phẩm' })
  @ApiParam({ name: 'soLuong', description: 'Số lượng mới' })
  @ApiResponse({ status: 200, description: 'Cập nhật giỏ hàng thành công' })
  @ApiResponse({ status: 400, description: 'Không đủ số lượng trong kho' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không có trong giỏ hàng' })
  updateCartItem(
    @Param('maSanPham') maSanPham: string,
    @Param('soLuong') soLuong: string,
    @CurrentAccount() account: any,
  ) {
    return this.donHangService.updateCartItem(account.id, +maSanPham, +soLuong);
  }

  @Delete('cart/remove/:maSanPham')
  @UseGuards(RolesGuard)
  @Roles(UserRole.KHACHHANG)
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi giỏ hàng (Khách hàng)' })
  @ApiParam({ name: 'maSanPham', description: 'ID sản phẩm cần xóa' })
  @ApiResponse({
    status: 200,
    description: 'Xóa sản phẩm khỏi giỏ hàng thành công',
  })
  @ApiResponse({ status: 404, description: 'Sản phẩm không có trong giỏ hàng' })
  removeFromCart(
    @Param('maSanPham') maSanPham: string,
    @CurrentAccount() account: any,
  ) {
    return this.donHangService.removeFromCart(account.id, +maSanPham);
  }

  @Delete('cart/clear')
  @UseGuards(RolesGuard)
  @Roles(UserRole.KHACHHANG)
  @ApiOperation({ summary: 'Xóa toàn bộ giỏ hàng (Khách hàng)' })
  @ApiResponse({ status: 200, description: 'Xóa giỏ hàng thành công' })
  clearCart(@CurrentAccount() account: any) {
    return this.donHangService.clearCart(account.id);
  }

  @Post('cart/checkout')
  @UseGuards(RolesGuard)
  @Roles(UserRole.KHACHHANG)
  @ApiOperation({ summary: 'Thanh toán giỏ hàng (Khách hàng)' })
  @ApiResponse({ status: 201, description: 'Thanh toán thành công' })
  @ApiResponse({
    status: 400,
    description: 'Giỏ hàng trống hoặc sản phẩm không đủ số lượng',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giỏ hàng' })
  checkoutCart(
    @Body()
    checkoutData: CheckoutCartDto,
    @CurrentAccount() account: any,
  ) {
    return this.donHangService.checkoutCart(account.id, checkoutData);
  }
}
