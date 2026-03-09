import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from '../vendors/menu-item.entity';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem])],
  providers: [MenuItemsService],
  controllers: [MenuItemsController],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
