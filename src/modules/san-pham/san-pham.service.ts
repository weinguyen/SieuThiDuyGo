import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSanPhamDto } from './dto/create-sanpham.dto';
import { UpdateSanPhamDto } from './dto/update-sanpham.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { SanPham } from './entities/san-pham.entity';
import { HinhAnhSanPham } from './entities/hinh-anh.entity';
import { NhanVien } from '../nhan-vien/entities/nhan-vien.entity';
import { DanhMuc } from '../danh-muc/entities/danh-muc.entity';
import { UserRole } from 'src/common/constants/constants';

@Injectable()
export class SanPhamService {
  constructor(
    @InjectRepository(SanPham)
    private readonly sanPhamRepository: Repository<SanPham>,
    @InjectRepository(HinhAnhSanPham)
    private readonly hinhAnhRepository: Repository<HinhAnhSanPham>,
    @InjectRepository(NhanVien)
    private readonly nhanVienRepository: Repository<NhanVien>,
    @InjectRepository(DanhMuc)
    private readonly danhMucRepository: Repository<DanhMuc>,
  ) {}

  async create(
    createSanPhamDto: CreateSanPhamDto,
    account: any,
  ): Promise<SanPham> {
    if (account.loai === UserRole.KHACHHANG) {
      throw new ForbiddenException('Chỉ nhân viên mới có quyền tạo sản phẩm');
    }
    const nhanVien = await this.nhanVienRepository.findOne({
      where: { taiKhoan: { id: account.id } },
    });
    if (!nhanVien) {
      throw new NotFoundException(
        `Nhân viên với ID ${account.id} không tồn tại`,
      );
    }

    const danhMuc = await this.danhMucRepository.findOne({
      where: { id: createSanPhamDto.danhMucId },
    });
    if (!danhMuc) {
      throw new NotFoundException(
        `Danh mục với ID ${createSanPhamDto.danhMucId} không tồn tại`,
      );
    }

    const sanPham = new SanPham();
    sanPham.ten = createSanPhamDto.ten;
    sanPham.soLuongHienCon = createSanPhamDto.soLuongHienCon;
    sanPham.hanSuDung = createSanPhamDto.hanSuDung;
    sanPham.ngaySanXuat = createSanPhamDto.ngaySanXuat;
    sanPham.moTa = createSanPhamDto.moTa;
    sanPham.gia = createSanPhamDto.gia;
    sanPham.soLuongDaBan = 0;
    sanPham.nhanVien = nhanVien;
    sanPham.danhMuc = danhMuc;
    const savedSanPham = await this.sanPhamRepository.save(sanPham);
    if (createSanPhamDto.hinhAnhs && createSanPhamDto.hinhAnhs.length > 0) {
      const savehinhAnhs = createSanPhamDto.hinhAnhs.map((hinhAnh) => {
        const newHinhAnh = new HinhAnhSanPham();
        newHinhAnh.hinhAnh = hinhAnh;
        newHinhAnh.sanPham = sanPham;
        return this.hinhAnhRepository.save(newHinhAnh);
      });
      await Promise.all(savehinhAnhs);
    }

    return this.findOne(savedSanPham.id);
  }

  async findAll(): Promise<SanPham[]> {
    return await this.sanPhamRepository.find({
      relations: {
        nhanVien: true,
        danhMuc: true,
        hinhAnhs: true,
        danhGias: true,
        khuyenMais: true,
      },
      select: {
        nhanVien: {
          tenNhanVien: true,
        },
      },
    });
  }

  async findByPage(stt: number): Promise<{
    data: SanPham[];
    total: number;
    page: number;
    limit: number;
  }> {
    const limit = 20;
    const skip = (stt - 1) * limit;

    const [data, total] = await this.sanPhamRepository.findAndCount({
      relations: {
        nhanVien: true,
        danhMuc: true,
        hinhAnhs: true,
        danhGias: true,
        khuyenMais: true,
      },
      take: limit,
      skip: skip,
    });

    return {
      data,
      total,
      page: stt,
      limit,
    };
  }

  async findOne(id: number): Promise<SanPham> {
    const sanPham = await this.sanPhamRepository.findOne({
      where: { id },
      relations: {
        nhanVien: true,
        danhMuc: true,
        hinhAnhs: true,
        danhGias: true,
        khuyenMais: true,
      },
    });

    if (!sanPham) {
      throw new NotFoundException(`Sản phẩm với ID ${id} không tồn tại`);
    }

    return sanPham;
  }

  async update(
    id: number,
    updateSanPhamDto: UpdateSanPhamDto,
    account: any,
  ): Promise<SanPham> {
    const sanPham = await this.findOne(id);
    Object.assign(sanPham, updateSanPhamDto);

    const nhanVien = await this.nhanVienRepository.findOne({
      where: { id: account.id },
    });
    if (!nhanVien) {
      throw new NotFoundException(
        `Nhân viên với ID ${account.id} không tồn tại`,
      );
    }
    sanPham.nhanVien = nhanVien;

    if (updateSanPhamDto.danhMucId) {
      const danhMuc = await this.danhMucRepository.findOne({
        where: { id: updateSanPhamDto.danhMucId },
      });
      if (!danhMuc) {
        throw new NotFoundException(
          `Danh mục với ID ${updateSanPhamDto.danhMucId} không tồn tại`,
        );
      }
      sanPham.danhMuc = danhMuc;
    }

    return await this.sanPhamRepository.save(sanPham);
  }

  async remove(id: number): Promise<void> {
    const sanPham = await this.findOne(id);
    await this.sanPhamRepository.remove(sanPham);
  }

  async findByName(ten: string): Promise<SanPham[]> {
    return await this.sanPhamRepository.find({
      where: [
        { ten: ILike(`%${ten}%`) }, // Tìm trong tên sản phẩm
        { moTa: ILike(`%${ten}%`) }, // Tìm trong mô tả sản phẩm
      ],
      relations: {
        nhanVien: true,
        danhMuc: true,
        hinhAnhs: true,
      },
    });
  }

  async findByDanhMuc(danhMucId: number): Promise<SanPham[]> {
    return await this.sanPhamRepository.find({
      where: {
        danhMuc: { id: danhMucId },
      },
      relations: {
        nhanVien: true,
        danhMuc: true,
        hinhAnhs: true,
      },
    });
  }
}
