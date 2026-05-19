import { PartialType } from '@nestjs/swagger';
import { CreateAlertasStockDto } from './create-alertas-stock.dto';

export class UpdateAlertasStockDto extends PartialType(CreateAlertasStockDto) {}
