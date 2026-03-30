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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meeting = void 0;
const typeorm_1 = require("typeorm");
const shared_1 = require("@meeting-mind/shared");
let Meeting = class Meeting {
    id;
    title;
    occurredAt;
    transcriptText;
    summary;
    actionItems;
    decisions;
    openQuestions;
    analysisStatus;
    createdAt;
    updatedAt;
};
exports.Meeting = Meeting;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Meeting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Meeting.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Meeting.prototype, "occurredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Meeting.prototype, "transcriptText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Meeting.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Meeting.prototype, "actionItems", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Meeting.prototype, "decisions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Meeting.prototype, "openQuestions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_1.AnalysisStatus,
        default: shared_1.AnalysisStatus.Pending,
    }),
    __metadata("design:type", String)
], Meeting.prototype, "analysisStatus", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Meeting.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Meeting.prototype, "updatedAt", void 0);
exports.Meeting = Meeting = __decorate([
    (0, typeorm_1.Entity)('meetings')
], Meeting);
//# sourceMappingURL=meeting.entity.js.map