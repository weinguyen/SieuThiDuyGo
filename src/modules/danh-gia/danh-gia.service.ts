import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDanhGiaDto } from './dto/create-danh-gia.dto';

import { DanhGia } from './entities/danh-gia.entity';
import { KhachHang } from '../khach-hang/entities/khach-hang.entity';
import { SanPham } from '../san-pham/entities/san-pham.entity';
import { UserRole } from 'src/common/constants/constants';

@Injectable()
export class DanhGiaService {
  constructor(
    @InjectRepository(DanhGia)
    private readonly danhGiaRepository: Repository<DanhGia>,
    @InjectRepository(KhachHang)
    private readonly khachHangRepository: Repository<KhachHang>,
    @InjectRepository(SanPham)
    private readonly sanPhamRepository: Repository<SanPham>,
  ) {}

  async create(
    createDanhGiaDto: CreateDanhGiaDto,
    accountId: number,
  ): Promise<DanhGia> {
    const khachHang = await this.khachHangRepository.findOne({
      where: { taiKhoan: { id: accountId } },
    });

    if (!khachHang) {
      throw new ForbiddenException(
        'Chỉ khách hàng mới được phép đánh giá sản phẩm',
      );
    }
    const sanPham = await this.sanPhamRepository.findOne({
      where: { id: createDanhGiaDto.sanPhamId },
    });
    if (!sanPham) {
      throw new NotFoundException(
        `Sản phẩm với ID ${createDanhGiaDto.sanPhamId} không tồn tại`,
      );
    }

    const danhGia = new DanhGia();
    danhGia.soSao = createDanhGiaDto.soSao;
    danhGia.noiDung = createDanhGiaDto.noiDung;
    danhGia.sanPhamId = sanPham.id;
    danhGia.sanPham = sanPham;
    danhGia.khachHangId = khachHang.id;
    danhGia.khachHang = khachHang;

    return this.danhGiaRepository.save(danhGia);
  }

  async findOne(id: number): Promise<DanhGia> {
    const danhGia = await this.danhGiaRepository.findOne({
      where: { id },
      relations: ['khachHang', 'sanPham'],
    });

    if (!danhGia) {
      throw new NotFoundException(`Đánh giá với ID ${id} không tồn tại`);
    }

    return danhGia;
  }

  async remove(id: number, account: any): Promise<{ message: string }> {
    const danhGia = await this.findOne(id);

    if (
      account.loai === UserRole.KHACHHANG &&
      danhGia.khachHangId !== account.id
    ) {
      throw new ForbiddenException('Bạn không có quyền xóa đánh giá này');
    }

    await this.danhGiaRepository.remove(danhGia);
    return { message: 'Đánh giá đã được xóa thành công' };
  }

  async getBySanPham(sanPhamId: number): Promise<DanhGia[]> {
    return this.danhGiaRepository.find({
      where: {
        sanPhamId,
      },
      relations: ['khachHang'],
      order: { ngayDanhGia: 'DESC' },
    });
  }

  async getByKhachHang(khachHangId: number): Promise<DanhGia[]> {
    return this.danhGiaRepository.find({
      where: { khachHangId },
      relations: ['sanPham'],
      order: { ngayDanhGia: 'DESC' },
    });
  }

  async getSanPhamRating(
    sanPhamId: number,
  ): Promise<{ averageRating: number; totalReviews: number }> {
    const reviews = await this.danhGiaRepository.find({
      where: {
        sanPhamId,
      },
    });

    if (reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + review.soSao, 0) / reviews.length;

    return {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    };
  }
}
