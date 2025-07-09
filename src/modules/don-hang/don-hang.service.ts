import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDonHangDto } from './dto/create-don-hang.dto';
import { UpdateDonHangDto } from './dto/update-don-hang.dto';
import { DonHang } from './entities/don-hang.entity';
import { AddToCartDto } from './dto/addtocard.dto';
import { PhuongThucThanhToan, TrangThaiDonHang } from './common/constant';
import { NhanVien } from '../nhan-vien/entities/nhan-vien.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KhachHang } from '../khach-hang/entities/khach-hang.entity';
import { ChiTietDonHang } from '../chi-tiet-don-hang/entities/chi-tiet-don-hang.entity';
import { SanPham } from '../san-pham/entities/san-pham.entity';
import { ThongTinLienHe } from '../thong-tin-lien-he/entities/thong-tin-lien-he.entity';
import { CheckoutCartDto } from './dto/checkoutcard.dto';

@Injectable()
export class DonHangService {
  constructor(
    @InjectRepository(DonHang)
    private readonly donHangRepository: Repository<DonHang>,
    @InjectRepository(ChiTietDonHang)
    private readonly chiTietDonHangRepository: Repository<ChiTietDonHang>,
    @InjectRepository(KhachHang)
    private readonly khachHangRepository: Repository<KhachHang>,
    @InjectRepository(SanPham)
    private readonly sanPhamRepository: Repository<SanPham>,
    @InjectRepository(NhanVien)
    private readonly nhanVienRepository: Repository<NhanVien>,
    @InjectRepository(ThongTinLienHe)
    private readonly thongTinLienHeRepository: Repository<ThongTinLienHe>,
  ) {}
  async addToCart(
    accountId: number,
    addToCartDto: AddToCartDto,
  ): Promise<DonHang | null> {
    const khachHang = await this.khachHangRepository.findOne({
      where: { taiKhoan: { id: accountId } },
    });
    if (!khachHang) {
      throw new ForbiddenException(
        'Chỉ khách hàng mới có quyền thêm sản phẩm vào giỏ hàng',
      );
    }
    const sanPham = await this.sanPhamRepository.findOne({
      where: { id: addToCartDto.sanPhamId },
    });

    if (!sanPham) {
      throw new ForbiddenException('Sản phẩm không tồn tại');
    }
    let donHangGioHang = await this.donHangRepository.findOne({
      where: {
        khachHang: { id: khachHang.id },
        trangThaiDonHang: TrangThaiDonHang.CHO_XAC_NHAN,
      },
      relations: ['chiTietDonHangs'],
    });

    if (!donHangGioHang) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const thongTinLienHe = new ThongTinLienHe();
      thongTinLienHe.tenNguoiNhan = 'Chưa nhập';
      thongTinLienHe.sdt = 'Chưa nhập';
      thongTinLienHe.diaChi = 'Chưa nhập';
      thongTinLienHe.ghiChu = 'Chưa nhập';

      donHangGioHang = new DonHang();
      donHangGioHang.tenDonHang = `Giỏ hàng - ${new Date().toISOString()}`;
      donHangGioHang.ngayChuanBiHang = today;
      donHangGioHang.ngayNhanHang = tomorrow;
      donHangGioHang.donViVanChuyen = 'Chưa chọn';
      donHangGioHang.phuongThucThanhToan = PhuongThucThanhToan.COD;

      donHangGioHang.tongTien = 0;
      donHangGioHang.trangThaiDonHang = TrangThaiDonHang.CHO_XAC_NHAN;
      donHangGioHang.khachHang = khachHang;

      donHangGioHang.chiTietDonHangs = [];

      donHangGioHang = await this.donHangRepository.save(donHangGioHang);
    }
    const existingChiTiet = donHangGioHang.chiTietDonHangs?.find(
      (ct) => ct.maSanPham === addToCartDto.sanPhamId,
    );

    if (existingChiTiet) {
      const newQuantity = existingChiTiet.soLuong + addToCartDto.soLuong;
      if (sanPham.soLuongHienCon < newQuantity) {
        throw new BadRequestException(
          `Tổng số lượng ${newQuantity} vượt quá số lượng có sẵn ${sanPham.soLuongHienCon}`,
        );
      }

      existingChiTiet.soLuong = newQuantity;
      existingChiTiet.thanhTien = existingChiTiet.donGia * newQuantity;

      await this.chiTietDonHangRepository.save(existingChiTiet);
    } else {
      // Nếu chưa có, tạo mới chi tiết đơn hàng
      const chiTietDonHang = new ChiTietDonHang();
      chiTietDonHang.maDonHang = donHangGioHang.id;
      chiTietDonHang.maSanPham = addToCartDto.sanPhamId;
      chiTietDonHang.donGia = sanPham.gia;
      chiTietDonHang.soLuong = addToCartDto.soLuong;
      chiTietDonHang.thanhTien = sanPham.gia * addToCartDto.soLuong;
      chiTietDonHang.donHang = donHangGioHang;
      chiTietDonHang.sanPham = sanPham;

      await this.chiTietDonHangRepository.save(chiTietDonHang);
    }

    await this.updateTongTienDonHang(donHangGioHang.id);

    return this.findOne(donHangGioHang.id);
  }

  async removeFromCart(
    accountId: number,
    sanPhamId: number,
  ): Promise<DonHang | null> {
    const khachHang = await this.khachHangRepository.findOne({
      where: { taiKhoan: { id: accountId } },
      relations: ['taiKhoan'],
    });

    if (!khachHang) {
      throw new ForbiddenException(
        'Chỉ khách hàng mới có quyền xóa sản phẩm khỏi giỏ hàng',
      );
    }

    const donHangGioHang = await this.donHangRepository.findOne({
      where: {
        khachHang: { id: khachHang.id },
        trangThaiDonHang: TrangThaiDonHang.CHO_XAC_NHAN,
      },
      relations: ['chiTietDonHangs'],
    });

    if (!donHangGioHang) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    // Tìm và xóa chi tiết đơn hàng
    const chiTietCanXoa = await this.chiTietDonHangRepository.findOne({
      where: {
        donHang: { id: donHangGioHang.id },
        sanPham: { id: sanPhamId },
      },
    });

    if (!chiTietCanXoa) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    await this.chiTietDonHangRepository.remove(chiTietCanXoa);
    await this.updateTongTienDonHang(donHangGioHang.id);

    return this.findOne(donHangGioHang.id);
  }

  async updateCartItem(
    accountId: number,
    sanPhamId: number,
    soLuongMoi: number,
  ): Promise<DonHang | null> {
    // Tìm khách hàng
    const khachHang = await this.khachHangRepository.findOne({
      where: { taiKhoan: { id: accountId } },
    });
    if (!khachHang) {
      throw new ForbiddenException(
        'Chỉ khách hàng mới có quyền cập nhật giỏ hàng',
      );
    }
    const donHangGioHang = await this.donHangRepository.findOne({
      where: {
        khachHang: { id: khachHang.id },
        trangThaiDonHang: TrangThaiDonHang.CHO_XAC_NHAN,
      },
    });

    if (!donHangGioHang) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    // Tìm chi tiết đơn hàng
    const chiTiet = await this.chiTietDonHangRepository.findOne({
      where: {
        maDonHang: donHangGioHang.id,
        sanPham: { id: sanPhamId },
      },
      relations: ['sanPham'],
    });

    if (!chiTiet) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    // Kiểm tra số lượng kho
    if (chiTiet.sanPham.soLuongHienCon < soLuongMoi) {
      throw new BadRequestException(
        `Sản phẩm ${chiTiet.sanPham.ten} chỉ còn ${chiTiet.sanPham.soLuongHienCon} sản phẩm trong kho`,
      );
    }

    // Cập nhật số lượng
    chiTiet.soLuong = soLuongMoi;
    chiTiet.thanhTien = chiTiet.donGia * soLuongMoi;

    await this.chiTietDonHangRepository.save(chiTiet);

    // Cập nhật tổng tiền
    await this.updateTongTienDonHang(donHangGioHang.id);

    return this.findOne(donHangGioHang.id);
  }

  async getCart(accountId: number): Promise<DonHang | null> {
    // Tìm khách hàng
    const khachHang = await this.khachHangRepository.findOne({
      where: { taiKhoan: { id: accountId } },
      relations: ['taiKhoan'],
    });

    if (!khachHang) {
      throw new ForbiddenException('Chỉ khách hàng mới có quyền xem giỏ hàng');
    }

    // Tìm đơn hàng giỏ hàng
    const donHangGioHang = await this.donHangRepository.findOne({
      where: {
        khachHang: { id: khachHang.id },
        trangThaiDonHang: TrangThaiDonHang.CHO_XAC_NHAN,
      },
      relations: {
        khachHang: true,
        chiTietDonHangs: {
          sanPham: {
            hinhAnhs: true,
          },
        },
      },
    });

    return donHangGioHang;
  }

  async clearCart(accountId: number): Promise<{ message: string }> {
    // Tìm khách hàng
    const khachHang = await this.khachHangRepository.findOne({
      where: { taiKhoan: { id: accountId } },
      relations: ['taiKhoan'],
    });

    if (!khachHang) {
      throw new ForbiddenException('Chỉ khách hàng mới có quyền xóa giỏ hàng');
    }

    // Tìm đơn hàng giỏ hàng
    const donHangGioHang = await this.donHangRepository.findOne({
      where: {
        khachHang: { id: khachHang.id },
        trangThaiDonHang: TrangThaiDonHang.CHO_XAC_NHAN,
      },
      relations: ['chiTietDonHangs'],
    });

    if (donHangGioHang) {
      // Xóa tất cả chi tiết đơn hàng
      await this.chiTietDonHangRepository.remove(
        donHangGioHang.chiTietDonHangs,
      );

      // Xóa đơn hàng
      await this.donHangRepository.remove(donHangGioHang);
    }

    return { message: 'Giỏ hàng đã được xóa thành công' };
  }

  async checkoutCart(
    accountId: number,
    checkoutCartDto: CheckoutCartDto,
  ): Promise<DonHang | null> {
    // Tìm khách hàng
    const khachHang = await this.khachHangRepository.findOne({
      where: { taiKhoan: { id: accountId } },
      relations: ['taiKhoan'],
    });

    if (!khachHang) {
      throw new ForbiddenException('Chỉ khách hàng mới có quyền thanh toán');
    }

    const donHangGioHang = await this.donHangRepository.findOne({
      where: {
        id: checkoutCartDto.id,
        khachHang: { id: khachHang.id },
        trangThaiDonHang: TrangThaiDonHang.CHO_XAC_NHAN,
      },
      relations: {
        khachHang: true,
        chiTietDonHangs: {
          sanPham: true,
        },
      },
    });

    if (!donHangGioHang) {
      throw new NotFoundException('Không tìm thấy giỏ hàng để thanh toán');
    }
    console.log(donHangGioHang);
    if (
      !donHangGioHang.chiTietDonHangs ||
      donHangGioHang.chiTietDonHangs.length === 0
    ) {
      throw new BadRequestException('Giỏ hàng trống, không thể thanh toán');
    }

    for (const chiTiet of donHangGioHang.chiTietDonHangs) {
      if (chiTiet.sanPham.soLuongHienCon < chiTiet.soLuong) {
        throw new BadRequestException(
          `Sản phẩm ${chiTiet.sanPham.ten} chỉ còn ${chiTiet.sanPham.soLuongHienCon} sản phẩm trong kho`,
        );
      }
    }
    const thongTinLienHe = new ThongTinLienHe();
    thongTinLienHe.tenNguoiNhan = checkoutCartDto.tenNguoiNhan || 'Chưa nhập';
    thongTinLienHe.sdt = checkoutCartDto.sdtNguoiNhan || 'Chưa nhập';
    thongTinLienHe.diaChi = checkoutCartDto.diaChiGiaoHang || 'Chưa nhập';
    thongTinLienHe.ghiChu = checkoutCartDto.ghiChu || 'Chưa nhập';

    donHangGioHang.donViVanChuyen =
      checkoutCartDto.donViVanChuyen || 'Giao hàng tiêu chuẩn';
    donHangGioHang.phuongThucThanhToan =
      checkoutCartDto.phuongThucThanhToan || PhuongThucThanhToan.COD;
    donHangGioHang.ngayChuanBiHang =
      checkoutCartDto.ngayChuanBiHang || new Date();
    donHangGioHang.ngayNhanHang = checkoutCartDto.ngayNhanHang;
    donHangGioHang.thongTinLienHe = thongTinLienHe;
    donHangGioHang.trangThaiDonHang = TrangThaiDonHang.DA_XAC_NHAN;
    const donHangDaXacNhan = await this.donHangRepository.save(donHangGioHang);

    return this.findOne(donHangDaXacNhan.id);
  }

  private async updateTongTienDonHang(donHangId: number): Promise<void> {
    const chiTietDonHangs = await this.chiTietDonHangRepository.find({
      where: { maDonHang: donHangId },
    });

    const tongTien = chiTietDonHangs.reduce(
      (sum, chiTiet) => sum + Number(chiTiet.thanhTien),
      0,
    );

    await this.donHangRepository.update(donHangId, { tongTien });
  }
  async create(
    createDonHangDto: CreateDonHangDto,
    account: any,
  ): Promise<DonHang | null> {
    // 1. Kiểm tra khách hàng tồn tại
    const khachHang = await this.khachHangRepository.findOne({
      where: { id: createDonHangDto.khachHangId },
    });

    if (!khachHang) {
      throw new NotFoundException(
        `Khách hàng với ID ${createDonHangDto.khachHangId} không tồn tại`,
      );
    }

    // 2. Kiểm tra sản phẩm và tính tổng tiền
    let tongTien = 0;
    const chiTietList: {
      sanPham: SanPham;
      soLuong: number;
      donGia: number;
      thanhTien: number;
    }[] = [];

    for (const chiTiet of createDonHangDto.chiTietDonHangs) {
      const sanPham = await this.sanPhamRepository.findOne({
        where: { id: chiTiet.sanPhamId },
      });

      if (!sanPham) {
        throw new NotFoundException(
          `Sản phẩm với ID ${chiTiet.sanPhamId} không tồn tại`,
        );
      }

      if (sanPham.soLuongHienCon < chiTiet.soLuong) {
        throw new BadRequestException(
          `Sản phẩm ${sanPham.ten} chỉ còn ${sanPham.soLuongHienCon} trong kho`,
        );
      }

      const thanhTien = sanPham.gia * chiTiet.soLuong;
      tongTien += thanhTien;

      chiTietList.push({
        sanPham,
        soLuong: chiTiet.soLuong,
        donGia: sanPham.gia,
        thanhTien,
      });
    }

    // 3. Tạo thông tin liên hệ
    const thongTinLienHe = new ThongTinLienHe();
    thongTinLienHe.tenNguoiNhan = createDonHangDto.tenNguoiNhan;
    thongTinLienHe.sdt = createDonHangDto.sdtNguoiNhan;
    thongTinLienHe.diaChi = createDonHangDto.diaChiGiaoHang;
    thongTinLienHe.ghiChu = createDonHangDto.ghiChu || '';

    const savedThongTin =
      await this.thongTinLienHeRepository.save(thongTinLienHe);

    const donHang = new DonHang();
    donHang.tenDonHang = createDonHangDto.tenDonHang;
    donHang.ngayChuanBiHang = createDonHangDto.ngayChuanBiHang;
    donHang.ngayNhanHang = createDonHangDto.ngayNhanHang;
    donHang.donViVanChuyen = createDonHangDto.donViVanChuyen;
    donHang.phuongThucThanhToan = createDonHangDto.phuongThucThanhToan;
    donHang.trangThaiDonHang = TrangThaiDonHang.DA_XAC_NHAN;
    donHang.tongTien = tongTien;
    donHang.khachHang = khachHang;
    donHang.thongTinLienHe = savedThongTin;

    const savedDonHang = await this.donHangRepository.save(donHang);

    for (const item of chiTietList) {
      const chiTietDonHang = new ChiTietDonHang();
      chiTietDonHang.maDonHang = savedDonHang.id;
      chiTietDonHang.maSanPham = item.sanPham.id;
      chiTietDonHang.soLuong = item.soLuong;
      chiTietDonHang.donGia = item.donGia;
      chiTietDonHang.thanhTien = item.thanhTien;
      chiTietDonHang.donHang = savedDonHang;
      chiTietDonHang.sanPham = item.sanPham;

      await this.chiTietDonHangRepository.save(chiTietDonHang);
    }

    return this.findOne(savedDonHang.id);
  }

  findAll() {
    return this.donHangRepository.find({
      relations: [
        'khachHang',
        'chiTietDonHangs.sanPham.hinhAnhs',
        'thongTinLienHe',
      ],
    });
  }
  async findByKhachHang(account: any) {
    const khachHang = await this.khachHangRepository.findOne({
      where: { taiKhoan: { id: account.id } },
    });

    return this.donHangRepository.find({
      where: { khachHang: { id: khachHang?.id } },
      relations: [
        'khachHang',
        'chiTietDonHangs',
        'chiTietDonHangs.sanPham',
        'chiTietDonHangs.sanPham.hinhAnhs',

        'thongTinLienHe',
      ],
    });
  }

  findOne(id: number): Promise<DonHang | null> {
    return this.donHangRepository.findOne({
      where: { id },
      relations: ['khachHang', 'chiTietDonHangs', 'thongTinLienHe'],
    });
  }
  getCartCount(accountId: number): Promise<number> {
    return this.donHangRepository.count({
      where: {
        khachHang: { taiKhoan: { id: accountId } },
      },
    });
  }

  update(id: number, updateDonHangDto: UpdateDonHangDto) {
    return `This action updates a #${id} donHang`;
  }

  remove(id: number) {
    return `This action removes a #${id} donHang`;
  }
}
