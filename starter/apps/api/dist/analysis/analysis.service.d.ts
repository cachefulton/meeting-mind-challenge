import { ConfigService } from '@nestjs/config';
import type { AnalysisResult } from '@meeting-mind/shared';
export declare class AnalysisService {
    private readonly configService;
    private readonly logger;
    private readonly model;
    constructor(configService: ConfigService);
    analyze(transcript: string): Promise<AnalysisResult>;
}
//# sourceMappingURL=analysis.service.d.ts.map