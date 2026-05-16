import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class VentasService {
    constructor(private readonly prismaService: PrismaService) {}

    async findAll() {
        return await this.prismaService.ventas.findMany({
            include: {
                detalleventas: true,
            }
        });
    }
}
