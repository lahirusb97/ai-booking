import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async findOrCreate(name: string, phone: string): Promise<Customer> {
    const existing = await this.customerRepo.findOne({ where: { phone } });
    if (existing) {
      if (existing.name !== name) {
        existing.name = name;
        await this.customerRepo.save(existing);
      }
      return existing;
    }

    const customer = this.customerRepo.create({ name, phone });
    return this.customerRepo.save(customer);
  }
}
