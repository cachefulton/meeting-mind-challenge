"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MeetingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shared_1 = require("@meeting-mind/shared");
const meeting_entity_1 = require("./meeting.entity");
const analysis_service_1 = require("../analysis/analysis.service");
let MeetingsService = MeetingsService_1 = class MeetingsService {
    meetingsRepo;
    analysisService;
    logger = new common_1.Logger(MeetingsService_1.name);
    constructor(meetingsRepo, analysisService) {
        this.meetingsRepo = meetingsRepo;
        this.analysisService = analysisService;
    }
    async create(dto) {
        const meeting = this.meetingsRepo.create({
            title: dto.title,
            occurredAt: dto.occurredAt,
            transcriptText: dto.transcriptText,
        });
        const saved = await this.meetingsRepo.save(meeting);
        try {
            const analysis = await this.analysisService.analyze(saved.transcriptText);
            saved.summary = analysis.summary;
            saved.actionItems = analysis.actionItems;
            saved.decisions = analysis.decisions;
            saved.openQuestions = analysis.openQuestions;
            saved.analysisStatus = shared_1.AnalysisStatus.Completed;
        }
        catch (err) {
            this.logger.error(`Analysis failed for meeting ${saved.id}`, err instanceof Error ? err.stack : err);
            saved.analysisStatus = shared_1.AnalysisStatus.Failed;
        }
        const updated = await this.meetingsRepo.save(saved);
        return this.toResponse(updated);
    }
    async findAll() {
        const meetings = await this.meetingsRepo.find({
            select: ['id', 'title', 'occurredAt', 'analysisStatus', 'createdAt'],
            order: { createdAt: 'DESC' },
        });
        return meetings.map((m) => ({
            id: m.id,
            title: m.title,
            occurredAt: m.occurredAt,
            analysisStatus: m.analysisStatus,
            createdAt: m.createdAt.toISOString(),
        }));
    }
    async findOne(id) {
        const meeting = await this.meetingsRepo.findOne({ where: { id } });
        if (!meeting) {
            throw new common_1.NotFoundException(`Meeting ${id} not found`);
        }
        return this.toResponse(meeting);
    }
    toResponse(m) {
        return {
            id: m.id,
            title: m.title,
            occurredAt: m.occurredAt,
            transcriptText: m.transcriptText,
            summary: m.summary,
            actionItems: m.actionItems,
            decisions: m.decisions,
            openQuestions: m.openQuestions,
            analysisStatus: m.analysisStatus,
            createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
            updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
        };
    }
};
exports.MeetingsService = MeetingsService;
exports.MeetingsService = MeetingsService = MeetingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meeting_entity_1.Meeting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        analysis_service_1.AnalysisService])
], MeetingsService);
//# sourceMappingURL=meetings.service.js.map