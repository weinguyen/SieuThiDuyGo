import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SanPhamModule } from './modules/san-pham/san-pham.module';
import { AuthModule } from './modules/auth/auth.module';
import { DanhMucModule } from './modules/danh-muc/danh-muc.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/role.guard';
import { ChiTietDonHangModule } from './modules/chi-tiet-don-hang/chi-tiet-don-hang.module';
import { NhanVien } from './modules/nhan-vien/entities/nhan-vien.entity';
import { NhanVienModule } from './modules/nhan-vien/nhan-vien.module';
import { DanhGiaModule } from './modules/danh-gia/danh-gia.module';
import { TaiKhoanModule } from './modules/tai-khoan/tai-khoan.module';
import { ThongTinLienHeModule } from './modules/thong-tin-lien-he/thong-tin-lien-he.module';
import { KhachHangModule } from './modules/khach-hang/khach-hang.module';
import { DonHang } from './modules/don-hang/entities/don-hang.entity';
import { DonHangModule } from './modules/don-hang/don-hang.module';
import { KhuyenMaiModule } from './modules/khuyen_mai/khuyen_mai.module';
@Module({
  imports: [
    SanPhamModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<'postgres'>('DB_TYPE'),
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    AuthModule,
    DanhMucModule,
    ChiTietDonHangModule,
    NhanVienModule,
    DanhGiaModule,
    TaiKhoanModule,
    ThongTinLienHeModule,
    KhachHangModule,
    DonHangModule,
    ChiTietDonHangModule,
    KhuyenMaiModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
