import { ProductSale } from '../entity/productSale.entity';
import { Sale } from '../entity/sale.entity';

export class SaleDTO {
  number: string;
  date: Date;
  clientName: string;
  marketplace: string;
  products: ProductDTO[];
  total: number;

  constructor(sale: Sale) {
    this.clientName = sale.clientName;
    this.date = sale.date;
    this.marketplace = sale.marketplace;
    this.number = sale.number;
    this.products = sale.products.map((product) => new ProductDTO(product));
    this.total = sale.products.reduce(
      (previous, productSale) =>
        previous + productSale.product.price * productSale.quantity,
      0,
    );
  }
}

export class ProductDTO {
  quantity: number;
  code: string;
  name: string;
  cost: number;
  observations: string;
  price: number;

  constructor(productSale: ProductSale) {
    this.quantity = productSale.quantity;
    this.code = productSale.product.code;
    this.name = productSale.product.name;
    this.observations = productSale.product.observations;
    this.cost = productSale.product.cost;
    this.price = productSale.product.price;
  }
}
