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
var AnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
const ANALYSIS_SCHEMA = {
    type: generative_ai_1.SchemaType.OBJECT,
    properties: {
        summary: {
            type: generative_ai_1.SchemaType.STRING,
            description: 'A concise 2-4 sentence summary of the meeting.',
        },
        actionItems: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    text: {
                        type: generative_ai_1.SchemaType.STRING,
                        description: 'The action item description.',
                    },
                    assignee: {
                        type: generative_ai_1.SchemaType.STRING,
                        description: 'The person assigned, if mentioned. Omit if unassigned.',
                    },
                },
                required: ['text'],
            },
            description: 'Action items identified in the transcript.',
        },
        decisions: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    text: {
                        type: generative_ai_1.SchemaType.STRING,
                        description: 'A decision that was made during the meeting.',
                    },
                },
                required: ['text'],
            },
            description: 'Key decisions reached during the meeting.',
        },
        openQuestions: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    text: {
                        type: generative_ai_1.SchemaType.STRING,
                        description: 'An unresolved question or topic needing follow-up.',
                    },
                },
                required: ['text'],
            },
            description: 'Open questions or unresolved items from the meeting.',
        },
    },
    required: ['summary', 'actionItems', 'decisions', 'openQuestions'],
};
const SYSTEM_PROMPT = `You are a meeting-analysis assistant. Given a meeting transcript, extract structured data. Be thorough but concise:
- Summary: 2-4 sentences capturing the essence of the meeting.
- Action items: every task, follow-up, or commitment mentioned. Include the assignee's name when one is stated or clearly implied.
- Decisions: conclusions or agreements the group reached.
- Open questions: unresolved topics, deferred items, or questions left unanswered.`;
let AnalysisService = AnalysisService_1 = class AnalysisService {
    configService;
    logger = new common_1.Logger(AnalysisService_1.name);
    model;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GOOGLE_AI_API_KEY');
        if (!apiKey) {
            throw new Error('GOOGLE_AI_API_KEY is not set. Cannot initialise AnalysisService.');
        }
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: ANALYSIS_SCHEMA,
                temperature: 0.2,
            },
            systemInstruction: SYSTEM_PROMPT,
        });
    }
    async analyze(transcript) {
        this.logger.log('Starting Gemini analysis…');
        const result = await this.model.generateContent(`Analyze the following meeting transcript:\n\n${transcript}`);
        const text = result.response.text();
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch {
            this.logger.error('Gemini returned non-JSON response', text);
            throw new Error('AI analysis returned an invalid response.');
        }
        if (!parsed.summary || !Array.isArray(parsed.actionItems)) {
            this.logger.error('Gemini response missing required fields', parsed);
            throw new Error('AI analysis response is missing required fields.');
        }
        this.logger.log(`Analysis complete — ${parsed.actionItems.length} action items, ` +
            `${parsed.decisions.length} decisions, ${parsed.openQuestions.length} open questions`);
        return parsed;
    }
};
exports.AnalysisService = AnalysisService;
exports.AnalysisService = AnalysisService = AnalysisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AnalysisService);
//# sourceMappingURL=analysis.service.js.map