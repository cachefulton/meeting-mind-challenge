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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meeting_entity_1 = require("./meeting.entity");
let MeetingsService = class MeetingsService {
    meetingsRepo;
    constructor(meetingsRepo) {
        this.meetingsRepo = meetingsRepo;
    }
    async create(dto) {
        const meeting = this.meetingsRepo.create({
            title: dto.title,
            occurredAt: dto.occurredAt,
            transcriptText: dto.transcriptText,
        });
        const saved = await this.meetingsRepo.save(meeting);
        return this.toResponse(saved);
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
exports.MeetingsService = MeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meeting_entity_1.Meeting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MeetingsService);
//# sourceMappingURL=meetings.service.js.map