import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { Vendor } from './vendor.entity';
import { MenuItem } from './menu-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor, MenuItem])],
  providers: [VendorsService],
  controllers: [VendorsController],
  exports: [VendorsService],
})
export class VendorsModule {}
