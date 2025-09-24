import { Resolver, Query } from '@nestjs/graphql';
import { ReportsService } from '../../modules/reports/reports.service';

@Resolver()
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Query(() => String)
  async generateReport(): Promise<string> {
    return 'Report generation not implemented yet';
  }
}
