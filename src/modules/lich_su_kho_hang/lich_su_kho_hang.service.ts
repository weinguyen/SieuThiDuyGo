import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateLichSuKhoHangDto } from './dto/create-lich_su_kho_hang.dto';
import {
  LichSuKhoHang,
  LoaiGiaoDich,
} from './entities/lich_su_kho_hang.entity';
import { SanPham } from '../san-pham/entities/san-pham.entity';
import { NhanVien } from '../nhan-vien/entities/nhan-vien.entity';

@Injectable()
export class LichSuKhoHangService {
  constructor(
    @InjectRepository(LichSuKhoHang)
    private readonly lichSuKhoHangRepository: Repository<LichSuKhoHang>,
    @InjectRepository(SanPham)
    private readonly sanPhamRepository: Repository<SanPham>,
    @InjectRepository(NhanVien)
    private readonly nhanVienRepository: Repository<NhanVien>,
  ) {}

  async create(
    createLichSuKhoHangDto: CreateLichSuKhoHangDto,
    account: any,
  ): Promise<LichSuKhoHang> {
    // Kiểm tra sản phẩm tồn tại
    const sanPham = await this.sanPhamRepository.findOne({
      where: { id: createLichSuKhoHangDto.sanPhamId },
    });

    if (!sanPham) {
      throw new NotFoundException(
        `Sản phẩm với ID ${createLichSuKhoHangDto.sanPhamId} không tồn tại`,
      );
    }

    const nhanVien = await this.nhanVienRepository.findOne({
      where: { taiKhoan: { id: account.id } },
    });

    const soLuongHienTai = sanPham.soLuongHienCon;
    let soLuongMoi = soLuongHienTai;

    switch (createLichSuKhoHangDto.loaiGiaoDich) {
      case LoaiGiaoDich.NHAP_KHO:
        soLuongMoi += createLichSuKhoHangDto.soLuongThayDoi;
        break;

      case LoaiGiaoDich.XUAT_KHO:
      case LoaiGiaoDich.HUY_HANG:
        if (soLuongHienTai < createLichSuKhoHangDto.soLuongThayDoi) {
          throw new BadRequestException(
            `Không đủ hàng để xuất. Hiện có: ${soLuongHienTai}, yêu cầu: ${createLichSuKhoHangDto.soLuongThayDoi}`,
          );
        }
        soLuongMoi -= createLichSuKhoHangDto.soLuongThayDoi;
        break;

      case LoaiGiaoDich.TRA_HANG:
        soLuongMoi += createLichSuKhoHangDto.soLuongThayDoi;
        break;

      case LoaiGiaoDich.DIEU_CHINH:
        soLuongMoi = createLichSuKhoHangDto.soLuongThayDoi;
        break;
    }

    await this.sanPhamRepository.update(
      { id: sanPham.id },
      { soLuongHienCon: soLuongMoi },
    );

    const lichSuKho = new LichSuKhoHang();
    lichSuKho.sanPhamId = createLichSuKhoHangDto.sanPhamId;
    lichSuKho.loaiGiaoDich = createLichSuKhoHangDto.loaiGiaoDich;
    lichSuKho.soLuongThayDoi = createLichSuKhoHangDto.soLuongThayDoi;
    lichSuKho.tonKhoSauCung = soLuongMoi;
    lichSuKho.sanPham = sanPham;

    if (nhanVien) {
      lichSuKho.nhanVienId = nhanVien.id;
      lichSuKho.nhanVien = nhanVien;
    }

    return await this.lichSuKhoHangRepository.save(lichSuKho);
  }

  async findAll(): Promise<LichSuKhoHang[]> {
    return await this.lichSuKhoHangRepository.find({
      relations: ['sanPham', 'nhanVien'],
      order: { ngayThucHien: 'DESC' },
    });
  }

  async findOne(id: number): Promise<LichSuKhoHang> {
    const lichSuKho = await this.lichSuKhoHangRepository.findOne({
      where: { id },
      relations: ['sanPham', 'nhanVien'],
    });

    if (!lichSuKho) {
      throw new NotFoundException(`Lịch sử kho với ID ${id} không tồn tại`);
    }

    return lichSuKho;
  }

  async findBySanPham(sanPhamId: number): Promise<LichSuKhoHang[]> {
    const sanPham = await this.sanPhamRepository.findOne({
      where: { id: sanPhamId },
    });

    if (!sanPham) {
      throw new NotFoundException(`Sản phẩm với ID ${sanPhamId} không tồn tại`);
    }

    return await this.lichSuKhoHangRepository.find({
      where: { sanPhamId },
      relations: ['nhanVien'],
      order: { ngayThucHien: 'DESC' },
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<LichSuKhoHang[]> {
    return await this.lichSuKhoHangRepository.find({
      where: {
        ngayThucHien: Between(startDate, endDate),
      },
      relations: ['sanPham', 'nhanVien'],
      order: { ngayThucHien: 'DESC' },
    });
  }

  async getThongKeKho(startDate?: Date, endDate?: Date) {
    let whereCondition = {};

    if (startDate && endDate) {
      whereCondition = {
        ngayThucHien: Between(startDate, endDate),
      };
    }

    const lichSuKho = await this.lichSuKhoHangRepository.find({
      where: whereCondition,
      relations: ['sanPham'],
    });
    const thongKeTheoLoai = {
      nhapKho: 0,
      xuatKho: 0,
      traHang: 0,
      huyHang: 0,
      dieuChinh: 0,
    };

    const thongKeTheoSanPham = new Map();

    lichSuKho.forEach((ls) => {
      // Thống kê theo loại
      switch (ls.loaiGiaoDich) {
        case LoaiGiaoDich.NHAP_KHO:
          thongKeTheoLoai.nhapKho += ls.soLuongThayDoi;
          break;
        case LoaiGiaoDich.XUAT_KHO:
          thongKeTheoLoai.xuatKho += ls.soLuongThayDoi;
          break;
        case LoaiGiaoDich.TRA_HANG:
          thongKeTheoLoai.traHang += ls.soLuongThayDoi;
          break;
        case LoaiGiaoDich.HUY_HANG:
          thongKeTheoLoai.huyHang += ls.soLuongThayDoi;
          break;
        case LoaiGiaoDich.DIEU_CHINH:
          thongKeTheoLoai.dieuChinh += 1;
          break;
      }

      // Thống kê theo sản phẩm
      const sanPhamId = ls.sanPham.id;
      if (!thongKeTheoSanPham.has(sanPhamId)) {
        thongKeTheoSanPham.set(sanPhamId, {
          id: sanPhamId,
          tenSanPham: ls.sanPham.ten,
          nhapKho: 0,
          xuatKho: 0,
          traHang: 0,
          huyHang: 0,
          dieuChinh: 0,
        });
      }

      const spStats = thongKeTheoSanPham.get(sanPhamId);
      switch (ls.loaiGiaoDich) {
        case LoaiGiaoDich.NHAP_KHO:
          spStats.nhapKho += ls.soLuongThayDoi;
          break;
        case LoaiGiaoDich.XUAT_KHO:
          spStats.xuatKho += ls.soLuongThayDoi;
          break;
        case LoaiGiaoDich.TRA_HANG:
          spStats.traHang += ls.soLuongThayDoi;
          break;
        case LoaiGiaoDich.HUY_HANG:
          spStats.huyHang += ls.soLuongThayDoi;
          break;
        case LoaiGiaoDich.DIEU_CHINH:
          spStats.dieuChinh += 1;
          break;
      }
    });

    return {
      tongSoGiaoDich: lichSuKho.length,
      thongKeTheoLoai,
      thongKeTheoSanPham: Array.from(thongKeTheoSanPham.values()),
      tuNgay: startDate,
      denNgay: endDate,
    };
  }
}
