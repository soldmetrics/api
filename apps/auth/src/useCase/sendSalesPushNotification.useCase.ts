import { Device, DeviceType, User } from '@app/common/database';
import { BaseUseCase } from '@app/common/utils/baseUseCase';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { ImportedSalesNotificationDTO } from '../../../sales-import/src/model/dto/importedSalesNotificationDTO';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { Sale } from '@app/common/database/model/entity/sale.entity';

export class SendSalesPushNotificationUseCase extends BaseUseCase {
  private readonly logger = new Logger(SendSalesPushNotificationUseCase.name);
  private readonly expoClient = new Expo();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
  ) {
    super();
  }

  async execute(payload: ImportedSalesNotificationDTO): Promise<void> {
    const { company, sales: importedSales } = payload;
    this.logger.log(`Pushing notifications for company ${company.name}`);

    const sales = await this.saleRepository.find({
      where: { id: In(importedSales.map((e) => e.id)) },
      relations: {
        products: {
          product: true,
        },
      },
    });
    const users = await this.userRepository.find({
      where: { company: { id: company.id } },
    });

    const devices = await this.deviceRepository.findBy({
      user: In(users.map((e) => e.id)),
      type: DeviceType.MOBILE,
      pushToken: Not(IsNull()),
    });

    if (devices.length == 0) {
      this.logger.log(
        `No devices found for company ${company.name}, skiping the push notifications step`,
      );

      return;
    }

    const messages = devices.reduce(
      (prev: ExpoPushMessage[], currentDevice: Device) => {
        const mappedMessages: ExpoPushMessage[] = sales.map((sale) => {
          const total = sale.products.reduce(
            (total, productSale) =>
              total + productSale.quantity * productSale.product.price,
            0,
          );

          return {
            to: currentDevice.pushToken,
            sound: 'default',
            title: `Nova venda em ${sale.marketplace}!`,
            body: `Você realizou uma venda em ${
              sale.marketplace
            } com valor total de R$${total.toFixed(2).replaceAll('.', ',')}`,
          };
        });

        return prev.concat(mappedMessages);
      },
      [],
    );

    const chunks = this.expoClient.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk =
          await this.expoClient.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        this.logger.error(
          `Error when sending push notification to expo platform: ${error}`,
        );
      }
    }

    this.logger.log(`Sucessfully pushed ${tickets.length} chunks to expo API.`);
  }
}
