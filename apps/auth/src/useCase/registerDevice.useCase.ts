import { Device, DeviceType, User } from '@app/common/database';
import { BaseUseCase } from '@app/common/utils/baseUseCase';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface RegisterDevicePayload {
  name: string;
  model?: string;
  type: DeviceType;
  pushToken: string;
  platform?: string;
}

export interface RegisterDeviceResponse {
  success: boolean;
  message: string;
}

Injectable();
export class RegisterDeviceUseCase extends BaseUseCase {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
  ) {
    super();
  }

  async execute(
    payload: RegisterDevicePayload,
    userId: number,
  ): Promise<RegisterDeviceResponse> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new BadRequestException('User not found!');
    }

    const deviceExists = await this.deviceRepository.exist({
      where: {
        user: { id: userId },
        pushToken: payload.pushToken,
        type: payload.type,
      },
    });

    if (deviceExists) {
      throw new BadRequestException(
        'Device with this push token already exists for this user!',
      );
    }

    const device = new Device();

    device.model = payload.model;
    device.name = payload.name;
    device.platform = payload.platform;
    device.pushToken = payload.pushToken;
    device.type = payload.type;
    device.user = user;

    await this.deviceRepository.save(device);

    return {
      success: true,
      message: 'Device sucessfully mapped to user',
    };
  }
}
