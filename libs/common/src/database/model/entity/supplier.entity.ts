import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['name'])
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ nullable: true })
  deliveryTime: number;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  lastOrder: Date;

  @Column({ nullable: true })
  lastDelivery: Date;

  // @OneToMany(() => Product, (product) => product.supplier)
  // products: Product[];
}
