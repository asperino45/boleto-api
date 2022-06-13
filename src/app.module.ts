import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BoletoModule } from './boleto/boleto.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          port: parseInt(process.env.API_PORT, 10) || 3000,
        }),
      ],
    }),
    BoletoModule,
  ],
})
export class AppModule {}
