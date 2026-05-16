import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ClientesService {
    constructor(private readonly prismaService: PrismaService) {}

    async findAll() {
        return await this.prismaService.clientes.findMany();
    }


}
