import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Company } from './company.entity';
import { ProductCostChange } from './productCostChange.entity';
import { ProductSale } from './productSale.entity';

@Entity()
@Unique('companyProduct', ['code', 'company'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'float', nullable: true, default: null })
  cost: number;

  @Column({ nullable: true, default: null })
  supplierName: string;

  // @ManyToOne(() => Supplier, (supplier) => supplier.products)
  // supplier: Supplier;

  @Column({ default: 0 })
  quantityStored: number;

  @Column({ nullable: true, default: null })
  lastSaleDate: Date;

  @Column({ nullable: true })
  lastUpdateDate?: Date;

  @Column({ default: false })
  isComposed: boolean;

  @Column()
  observations: string;

  @Column()
  shouldUpdate: boolean;

  @ManyToOne(() => Company, (company) => company.products)
  company: Company;

  @OneToMany(() => ProductSale, (productSale) => productSale.product, {
    cascade: ['remove', 'soft-remove'],
  })
  sales: ProductSale[];

  @OneToMany(() => ProductCostChange, (costChange) => costChange.product, {
    cascade: ['remove', 'soft-remove'],
  })
  costChanges: ProductCostChange[];

  @Column({ nullable: true, default: '' })
  curve: string;

  @Column({ nullable: true, default: '' })
  idIntegration: string;

  // @OneToOne(() => Kit, (kit) => kit.rootProduct, {
  //   cascade: ['remove', 'soft-remove'],
  // })
  // rootKit: Kit;

  // @OneToMany(() => ProductKit, (productKit) => productKit.product)
  // parentKits: ProductKit[];

  // @Column({ nullable: true, default: '' })
  // parentCode: string;

  @Column({ nullable: true, default: null })
  lastSaleMarketplace?: string;

  constructor(
    code: string,
    name: string,
    price: number,
    cost: number,
    // supplier: Supplier,
    quantityStored: number,
    isComposed: boolean,
    observations: string,
    company: Company,
    idIntegration: string,
  ) {
    this.code = code;
    this.name = name;
    this.price = price;
    this.cost = cost;
    // this.supplier = supplier;
    this.quantityStored = quantityStored;
    this.isComposed = isComposed;
    this.observations = observations;
    this.company = company;
    this.shouldUpdate = false;
    this.idIntegration = idIntegration;
  }
}
