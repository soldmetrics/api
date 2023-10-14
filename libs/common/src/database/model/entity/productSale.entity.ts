import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';
import { Sale } from './sale.entity';

@Entity()
@Unique('productSale', ['product', 'sale'])
export class ProductSale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.sales, { cascade: ['insert'] })
  public product: Product;

  @ManyToOne(() => Sale, (sale) => sale.products)
  public sale: Sale;

  @Column({ type: 'int' })
  public quantity: number;

  constructor(product: Product, sale: Sale, quantity: number) {
    this.product = product;
    this.sale = sale;
    this.quantity = quantity;
  }
}
