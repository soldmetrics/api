import {
  Company,
  Plan,
  Role,
  RolesEnum,
  Subscription,
  User,
} from '@app/common/database';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from '../model/dto/register/registerDTO';
import { RegisterCompanyDto } from '../model/dto/register/registerCompanyDTO';
import { RegisterUserDto } from '../model/dto/register/registerUserDTO';
import { UserDetailsDTO } from '../model/dto/userDetailsDTO';
import { RegisterSubscriptionDto } from '../model/dto/register/registerSubscriptionDTO';
import { SubscriptionDetailsDTO } from '../model/dto/subscriptionDetailsDTO';
import * as moment from 'moment';
import { BaseUseCase, RollbackTypeEnum } from '@app/common/utils/baseUseCase';
import { JwtService } from '@nestjs/jwt';

export interface RegisterResponseInterface {
  user: UserDetailsDTO;
  subscription: SubscriptionDetailsDTO;
  accessToken: string;
}

Injectable();
export class RegisterUseCase extends BaseUseCase {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(Plan) private planRepository: Repository<Plan>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private jwtService: JwtService,
  ) {
    super();
  }

  async execute(data: RegisterDto): Promise<RegisterResponseInterface> {
    const {
      user: userData,
      company: companyData,
      subscription: subscriptionData,
    } = data;
    let subscription: Subscription | undefined;

    await this.validateEmail(userData.email);

    const role: Role = await this.roleRepository.findOneBy({
      name: RolesEnum.ROLE_COMPANY_MANAGER,
    });

    try {
      const user = await this.createUserAndCompany(companyData, userData, role);

      this.rollbackStack.push({
        object: user,
        repository: this.usersRepository,
        type: RollbackTypeEnum.CREATE,
      });

      this.rollbackStack.push({
        object: user.company,
        repository: this.companyRepository,
        type: RollbackTypeEnum.CREATE,
      });

      subscription = await this.createSubscription(
        user.company,
        subscriptionData,
      );

      this.rollbackStack.push({
        object: subscription,
        repository: this.subscriptionRepository,
        type: RollbackTypeEnum.CREATE,
      });

      const accessToken = this.jwtService.sign({
        userId: user.id,
        email: user.email,
        roles: user.roles,
      });

      return {
        user: new UserDetailsDTO(user),
        subscription: new SubscriptionDetailsDTO(subscription),
        accessToken,
      };
    } catch (error) {
      console.error(error);

      await this.rollback();

      throw new HttpException(
        'Error during user creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async createUserAndCompany(
    companyData: RegisterCompanyDto,
    userData: RegisterUserDto,
    role: Role,
  ): Promise<User> {
    const newCompany = new Company();
    const newUser = new User();
    newUser.name = `${userData.firstName.trim()} ${userData.lastName.trim()}`;
    newCompany.name = companyData ? companyData.name : newUser.name;

    newUser.email = userData.email;
    newUser.password = userData.password;
    newUser.company = newCompany;
    newUser.roles = [role];
    newUser.phone = userData.phone;

    newUser.hashPassword();

    return await this.usersRepository.save(newUser);
  }

  private async createSubscription(
    company: Company,
    subscriptionData: RegisterSubscriptionDto,
  ): Promise<Subscription> {
    let plan;

    if (subscriptionData) {
      plan = await this.planRepository.findOneBy({
        id: subscriptionData.planId,
      });

      if (!plan) {
        throw new HttpException(
          'Could not find provided plan',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      plan = await this.planRepository.findOneBy({
        name: 'Sold Metrics - Teste Grátis',
      });
    }

    const newSubscription = new Subscription();
    newSubscription.company = company;
    newSubscription.plan = plan;
    newSubscription.startDate = subscriptionData
      ? moment(subscriptionData.startDate).add(3, 'hours').toDate()
      : moment().toDate();

    newSubscription.endTrial = moment(newSubscription.startDate)
      .add(1, 'months')
      .toDate();

    return this.subscriptionRepository.save(newSubscription);
  }

  async validateEmail(email: string) {
    const user = await this.usersRepository.findOneBy({
      email,
    });

    if (user) {
      throw new HttpException(
        'Email already being used',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async retrieveCompany(companyId: number): Promise<Company> {
    const company = await this.companyRepository.findOneBy({ id: companyId });

    if (!company) {
      throw new HttpException('Company not found', HttpStatus.BAD_REQUEST);
    }

    return company;
  }
}
