import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductCostChange {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.costChanges)
  product: Product;

  @Column({ type: 'float', nullable: true, default: null })
  previousCost: number;

  @Column({ type: 'float', nullable: true, default: null })
  newCost: number;

  @Column()
  date: Date;

  @Column({ nullable: true, default: null })
  integrationEventId: string;

  constructor(
    product: Product,
    previousCost: number,
    newCost: number,
    date: Date,
  ) {
    this.product = product;
    this.previousCost = previousCost;
    this.newCost = newCost;
    this.date = date;
  }
}
