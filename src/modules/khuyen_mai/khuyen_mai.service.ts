import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CreateKhuyenMaiDto } from './dto/create-khuyen_mai.dto';
import { UpdateKhuyenMaiDto } from './dto/update-khuyen_mai.dto';
import { KhuyenMai } from './entities/khuyen_mai.entity';
import { SanPham } from '../san-pham/entities/san-pham.entity';

@Injectable()
export class KhuyenMaiService {
  constructor(
    @InjectRepository(KhuyenMai)
    private readonly khuyenMaiRepository: Repository<KhuyenMai>,
    @InjectRepository(SanPham)
    private readonly sanPhamRepository: Repository<SanPham>,
  ) {}

  async create(createKhuyenMaiDto: CreateKhuyenMaiDto): Promise<KhuyenMai> {
    // Validate ngày bắt đầu và kết thúc
    if (createKhuyenMaiDto.ngayBatDau >= createKhuyenMaiDto.ngayKetThuc) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    // Kiểm tra sản phẩm tồn tại
    const sanPhams = await this.sanPhamRepository.find({
      where: { id: In(createKhuyenMaiDto.sanPhamIds) },
    });

    if (sanPhams.length !== createKhuyenMaiDto.sanPhamIds.length) {
      throw new NotFoundException('Một số sản phẩm không tồn tại');
    }

    // Tạo khuyến mãi mới
    const khuyenMai = new KhuyenMai();
    khuyenMai.phanTramGiam = createKhuyenMaiDto.phanTramGiam;
    khuyenMai.moTa = createKhuyenMaiDto.moTa;
    khuyenMai.ngayBatDau = createKhuyenMaiDto.ngayBatDau;
    khuyenMai.ngayKetThuc = createKhuyenMaiDto.ngayKetThuc;
    khuyenMai.sanPhams = sanPhams;

    return await this.khuyenMaiRepository.save(khuyenMai);
  }

  async findAll(): Promise<KhuyenMai[]> {
    return await this.khuyenMaiRepository.find({
      relations: ['sanPhams'],
      order: { ngayTao: 'DESC' },
    });
  }

  async findOne(id: number): Promise<KhuyenMai> {
    const khuyenMai = await this.khuyenMaiRepository.findOne({
      where: { id },
      relations: ['sanPhams'],
    });

    if (!khuyenMai) {
      throw new NotFoundException(`Khuyến mãi với ID ${id} không tồn tại`);
    }

    return khuyenMai;
  }

  async update(
    id: number,
    updateKhuyenMaiDto: UpdateKhuyenMaiDto,
  ): Promise<KhuyenMai> {
    const khuyenMai = await this.findOne(id);

    // Validate ngày nếu có cập nhật
    const ngayBatDau = updateKhuyenMaiDto.ngayBatDau || khuyenMai.ngayBatDau;
    const ngayKetThuc = updateKhuyenMaiDto.ngayKetThuc || khuyenMai.ngayKetThuc;

    if (ngayBatDau >= ngayKetThuc) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    // Cập nhật thông tin cơ bản
    if (updateKhuyenMaiDto.phanTramGiam !== undefined) {
      khuyenMai.phanTramGiam = updateKhuyenMaiDto.phanTramGiam;
    }
    if (updateKhuyenMaiDto.moTa !== undefined) {
      khuyenMai.moTa = updateKhuyenMaiDto.moTa;
    }
    if (updateKhuyenMaiDto.ngayBatDau !== undefined) {
      khuyenMai.ngayBatDau = updateKhuyenMaiDto.ngayBatDau;
    }
    if (updateKhuyenMaiDto.ngayKetThuc !== undefined) {
      khuyenMai.ngayKetThuc = updateKhuyenMaiDto.ngayKetThuc;
    }

    // Cập nhật danh sách sản phẩm nếu có
    if (updateKhuyenMaiDto.sanPhamIds) {
      const sanPhams = await this.sanPhamRepository.find({
        where: { id: In(updateKhuyenMaiDto.sanPhamIds) },
      });

      if (sanPhams.length !== updateKhuyenMaiDto.sanPhamIds.length) {
        throw new NotFoundException('Một số sản phẩm không tồn tại');
      }

      khuyenMai.sanPhams = sanPhams;
    }

    return await this.khuyenMaiRepository.save(khuyenMai);
  }

  async remove(id: number): Promise<{ message: string }> {
    const khuyenMai = await this.findOne(id);

    // Kiểm tra nếu khuyến mãi đang diễn ra
    const today = new Date();
    if (khuyenMai.ngayBatDau <= today && khuyenMai.ngayKetThuc >= today) {
      throw new BadRequestException('Không thể xóa khuyến mãi đang diễn ra');
    }

    await this.khuyenMaiRepository.remove(khuyenMai);
    return { message: `Đã xóa khuyến mãi có ID ${id} thành công` };
  }

  // Lấy khuyến mãi đang áp dụng
  async findActivePromotions(): Promise<KhuyenMai[]> {
    const today = new Date();
    return await this.khuyenMaiRepository.find({
      where: {
        ngayBatDau: LessThanOrEqual(today),
        ngayKetThuc: MoreThanOrEqual(today),
      },
      relations: ['sanPhams'],
    });
  }

  // Lấy khuyến mãi theo sản phẩm
  async findBySanPham(sanPhamId: number): Promise<KhuyenMai[]> {
    const today = new Date();
    return await this.khuyenMaiRepository
      .createQueryBuilder('khuyenMai')
      .innerJoin('khuyenMai.sanPhams', 'sanPham')
      .where('sanPham.id = :sanPhamId', { sanPhamId })
      .andWhere('khuyenMai.ngayBatDau <= :today', { today })
      .andWhere('khuyenMai.ngayKetThuc >= :today', { today })
      .getMany();
  }

  // Tính giá sau khuyến mãi
  async tinhGiaSauKhuyenMai(
    sanPhamId: number,
    giaGoc: number,
  ): Promise<number> {
    const khuyenMais = await this.findBySanPham(sanPhamId);

    if (khuyenMais.length === 0) {
      return giaGoc;
    }

    // Lấy khuyến mãi có phần trăm giảm cao nhất
    const khuyenMaiToiUu = khuyenMais.reduce((max, current) =>
      current.phanTramGiam > max.phanTramGiam ? current : max,
    );

    const giaGiam = giaGoc * (khuyenMaiToiUu.phanTramGiam / 100);
    return Math.max(0, giaGoc - giaGiam);
  }
}
