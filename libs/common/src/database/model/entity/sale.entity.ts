import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Company } from './company.entity';
import { ProductSale } from './productSale.entity';

export enum SaleType {
  PEDIDO,
  NOTA,
}

@Entity()
@Unique('saleNumber', ['company', 'number', 'saleType'])
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: string;

  @Column()
  date: Date;

  @Column()
  clientName?: string;

  @Column({ nullable: true })
  marketplace?: string;

  @Column({ type: 'enum', enum: SaleType })
  saleType: SaleType;

  @OneToMany(() => ProductSale, (productSale) => productSale.sale, {
    cascade: ['remove', 'soft-remove'],
  })
  products: ProductSale[];

  @ManyToOne(() => Company, (company) => company.sales, { cascade: [] })
  company: Company;

  constructor(
    number: string,
    date: Date,
    clientName: string,
    saleType: SaleType,
    company: Company,
    marketplace: string,
    // products: ProductSale[],
  ) {
    this.number = number;
    this.date = date;
    this.clientName = clientName;
    this.saleType = saleType;
    // this.products = products;
    this.company = company;
    this.marketplace = marketplace;
  }
}
