import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VendorsModule } from './vendors/vendors.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { ServicesModule } from './services/services.module';
import { OrdersModule } from './orders/orders.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { User } from './users/user.entity';
import { Vendor } from './vendors/vendor.entity';
import { MenuItem } from './vendors/menu-item.entity';
import { ServiceItem } from './services/service.entity';
import { Order } from './orders/order.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MYSQL_HOST', 'localhost'),
        port: configService.get<number>('MYSQL_PORT', 3306),
        username: configService.get('MYSQL_USER', 'root'),
        password: configService.get('MYSQL_PASSWORD', 'password'),
        database: configService.get('MYSQL_DB', 'hapmenu'),
        entities: [User, Vendor, MenuItem, ServiceItem, Order],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    VendorsModule,
    MenuItemsModule,
    ServicesModule,
    OrdersModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
