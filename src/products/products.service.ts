import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDTO } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
    // return createProductDto;
    // return 'This action adds a new product';
  }

  async findAll(paginationDTO: PaginationDTO) {
    const { page, limit } = paginationDTO;
    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / (limit ?? 1));

    return {
      data: await this.product.findMany({
        skip: ((page ?? 1) - 1) * (limit ?? 1),
        take: limit,
        where: {
          available: true,
        },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
    // return `This action returns all products`;
  }

  async findOne(id: number) {
    const productfind = await this.product.findUnique({
      where: { id, available: true },
    });

    if (!productfind) {
      throw new NotFoundException(`Product with id #${id} not found.`);
    }
    // return `This action returns a #${id} product`;
    return productfind;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: updateProductDto,
    });
    // return `This action updates a #${id} product`;
  }

  async remove(id: number) {
    await this.findOne(id);

    const product = await this.product.update({
      where: { id: id },
      data: {
        available: false,
      },
    });

    // return this.product.delete({
    //   where: { id: id },
    // });
    // return `This action removes a #${id} product`;

    return product;
  }
}
