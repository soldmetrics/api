/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Company,
  Subscription,
  SubscriptionStatusEnum,
  User,
} from '@app/common/database';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUseCase } from '@app/common/utils/baseUseCase';
import Stripe from 'stripe';
import { BillingDTO } from '../billing.controller';

const stripe = new Stripe(process.env.STRIPE_KEY_SECRET);
const URL = 'http://192.168.1.3';

export interface BillingResponseInterface {
  url: string;
}

Injectable();
export class BillingUseCase extends BaseUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {
    super();
  }

  async execute(
    userId: number,
    body: BillingDTO,
  ): Promise<BillingResponseInterface> {
    try {
      const { priceId, urlSuccess, urlCancel } = body;

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: { company: true, roles: true },
      });

      if (!user) {
        throw new BadRequestException('User not found!');
      }

      const company = await this.companyRepository.findOneBy({
        id: user.company.id,
      });
      let customerId = company?.billingCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user?.email,
          name: user?.name,
        });

        customerId = customer.id;

        await this.companyRepository.update(
          {
            id: company.id,
          },
          {
            billingCustomerId: customer.id,
          },
        );
      }

      const session = await stripe.checkout.sessions.create({
        locale: 'pt-BR',
        billing_address_collection: 'auto',
        mode: 'subscription',
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${URL}/billing/redirect?url=${urlSuccess}`,
        cancel_url: `${URL}/billing/redirect?url=${urlCancel}`,
        subscription_data: {
          trial_period_days: 30,
          trial_settings: {
            end_behavior: {
              missing_payment_method: 'pause',
            },
          },
        },
        payment_method_collection: 'if_required',
      });

      await this.subscriptionRepository.update(
        { company: { id: company.id } },
        { sessionId: session.id },
      );

      return {
        url: session.url,
      };
    } catch (error) {
      console.log(`[Stripe Error] ${error}`);
    }

    return null;
  }

  async success(): Promise<void> {
    return;
  }

  async webhook(sig: string, body: any): Promise<void> {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_KEY_WEBHOOK,
      );

      console.log(`[${event.type}]: ${JSON.stringify(event)}`);

      switch (event.type) {
        case 'checkout.session.completed':
          // Atualizando o subscriptionId através do sessionId
          await this.subscriptionRepository.update(
            {
              sessionId: event?.data?.object?.id,
            },
            {
              subscriptionId: event?.data?.object?.subscription as string,
              status: SubscriptionStatusEnum.ACTIVE,
            },
          );
          break;
        case 'customer.subscription.created':
          // Atualizando subscription para pago
          await this.subscriptionRepository.update(
            {
              subscriptionId: event?.data?.object?.id,
            },
            {
              status: SubscriptionStatusEnum.ACTIVE,
            },
          );
          break;
        case 'customer.subscription.deleted':
          // Atualizando subscription para assinatura cancelada
          await this.subscriptionRepository.update(
            {
              subscriptionId: event?.data?.object?.id,
            },
            {
              status: SubscriptionStatusEnum.CANCELLED,
            },
          );
          break;
        case 'customer.subscription.trial_will_end':
          break;
        case 'customer.subscription.updated':
          // Criar uma validação de status para atualizar subscription de acordo
          // incomplete, incomplete_expired, trialing, active, past_due, canceled, or unpaid
          const status = event?.data?.object?.status;
          console.log(`[status]: ${status}`);
          // Atualizar subscription de acordo com subscription do stripe
          await this.subscriptionRepository.update(
            {
              subscriptionId: event?.data?.object?.id,
            },
            {
              status: SubscriptionStatusEnum.CANCELLED,
            },
          );
          break;
      }

      return;
    } catch (err) {
      console.log(`[Webhook Error]: ${err.message}`);
      throw new HttpException(
        `Webhook Error: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
