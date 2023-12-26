import {
  Integration,
  IntegrationStatus,
} from '@app/common/database/model/entity/integration.entity';
import { BaseUseCase } from '@app/common/utils/baseUseCase';
import { HttpService } from '@nestjs/axios';
import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

export interface Oauth2Response {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
}

export class SetMercadolivreIntegrationUseCase extends BaseUseCase {
  constructor(
    private httpService: HttpService,
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
  ) {
    super();
  }

  async execute(code: string, state: string): Promise<string> {
    const integration = await this.getIntegration(state);

    if (!integration) {
      throw new BadRequestException(
        'Could not find integration by state, please try to setup again',
        'Could not find integration by state, please try to setup again',
      );
    }

    const integrationTokenResponse = await this.retrieveIntegrationToken(code);
    const nickname = await this.fetchAccountName(integrationTokenResponse);
    await this.updateIntegration(
      integration,
      integrationTokenResponse,
      nickname,
    );

    return 'Integration sucesfully set!';
  }

  private async getIntegration(state: string): Promise<Integration> {
    const splittedState = state.split('integration-');
    const integrationId = atob(splittedState[1].split('verifier-')[0]);
    const verificationState = splittedState[1].split('verifier-')[1];

    return await this.integrationRepository.findOneBy({
      id: parseInt(integrationId),
      verificationState,
    });
  }

  private async retrieveIntegrationToken(
    code: string,
  ): Promise<Oauth2Response> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.mercadolibre.com/oauth/token',
          {
            grant_type: 'authorization_code',
            client_id: 5783633022746754,
            client_secret: 'Ufd3QUl4gf28jH5rQWVTccJyymu9VRuD',
            redirect_uri: process.env.MERCADOLIVRE_REDIRECT_URL,
            code,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      if (
        response.status !== 200 ||
        !response.data.access_token ||
        !response.data.refresh_token
      ) {
        throw new BadRequestException(
          'Could not verify token with Mercadolivre, please try to setup again',
          'Could not verify token with Mercadolivre, please try to setup again',
        );
      }

      return response.data;
    } catch (error) {
      console.log('error fetching integration token', error);
      throw new BadRequestException(
        'Could not verify token with Mercadolivre, please try to setup again',
        'Could not verify token with Mercadolivre, please try to setup again',
      );
    }
  }

  private async updateIntegration(
    integration: Integration,
    tokenResponse: Oauth2Response,
    nickname: string,
  ): Promise<Integration> {
    integration.status = IntegrationStatus.ACTIVE;
    integration.token = tokenResponse.access_token;
    integration.userCode = tokenResponse.refresh_token;
    integration.accountName = nickname;

    return this.integrationRepository.save(integration);
  }

  private async fetchAccountName(
    tokenResponse: Oauth2Response,
  ): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://api.mercadolibre.com/users/me', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }),
      );

      if (response.status !== 200) {
        throw new BadRequestException(
          'Could not verify token with Mercadolivre, please try to setup again',
          'Could not verify token with Mercadolivre, please try to setup again',
        );
      }

      return response.data.nickname;
    } catch (error) {
      console.log('error fetching account data', error);
      throw new BadRequestException(
        'Could not verify token with Mercadolivre, please try to setup again',
        'Could not verify token with Mercadolivre, please try to setup again',
      );
    }
  }
}
