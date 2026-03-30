import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  type GenerativeModel,
  type Schema,
  SchemaType,
} from '@google/generative-ai';
import type { AnalysisResult } from '@meeting-mind/shared';

const ANALYSIS_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description:
        'A short, descriptive title for the meeting (max 10 words). Should capture the main topic or purpose.',
    },
    summary: {
      type: SchemaType.STRING,
      description: 'A concise 2-4 sentence summary of the meeting.',
    },
    actionItems: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: {
            type: SchemaType.STRING,
            description: 'The action item description.',
          },
          assignee: {
            type: SchemaType.STRING,
            description:
              'The person assigned, if mentioned. Omit if unassigned.',
          },
        },
        required: ['text'],
      },
      description: 'Action items identified in the transcript.',
    },
    decisions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: {
            type: SchemaType.STRING,
            description: 'A decision that was made during the meeting.',
          },
        },
        required: ['text'],
      },
      description: 'Key decisions reached during the meeting.',
    },
    openQuestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: {
            type: SchemaType.STRING,
            description: 'An unresolved question or topic needing follow-up.',
          },
        },
        required: ['text'],
      },
      description: 'Open questions or unresolved items from the meeting.',
    },
  },
  required: ['title', 'summary', 'actionItems', 'decisions', 'openQuestions'],
};

const SYSTEM_PROMPT = `You are a meeting-analysis assistant. Given a meeting transcript, extract structured data. Be thorough but concise:
- Title: a short, descriptive title for the meeting (max 10 words) that captures the main topic or purpose.
- Summary: 2-4 sentences capturing the essence of the meeting.
- Action items: every task, follow-up, or commitment mentioned. Include the assignee's name when one is stated or clearly implied.
- Decisions: conclusions or agreements the group reached.
- Open questions: unresolved topics, deferred items, or questions left unanswered.`;

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly model: GenerativeModel;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      throw new Error(
        'GOOGLE_AI_API_KEY is not set. Cannot initialise AnalysisService.',
      );
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName =
      this.configService.get<string>('GOOGLE_AI_MODEL') ?? 'gemini-2.5-flash';
    this.model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_SCHEMA,
        temperature: 0.2,
      },
      systemInstruction: SYSTEM_PROMPT,
    });
  }

  async analyze(transcript: string): Promise<AnalysisResult> {
    this.logger.log('Starting Gemini analysis…');

    const result = await this.model.generateContent(
      `Analyze the following meeting transcript:\n\n${transcript}`,
    );

    const text = result.response.text();

    let parsed: AnalysisResult;
    try {
      parsed = JSON.parse(text) as AnalysisResult;
    } catch {
      this.logger.error('Gemini returned non-JSON response', text);
      throw new Error('AI analysis returned an invalid response.');
    }

    if (
      !parsed.title ||
      !parsed.summary ||
      !Array.isArray(parsed.actionItems) ||
      !Array.isArray(parsed.decisions) ||
      !Array.isArray(parsed.openQuestions)
    ) {
      this.logger.error('Gemini response missing required fields', parsed);
      throw new Error('AI analysis response is missing required fields.');
    }

    this.logger.log(
      `Analysis complete — ${parsed.actionItems.length} action items, ` +
        `${parsed.decisions.length} decisions, ${parsed.openQuestions.length} open questions`,
    );

    return parsed;
  }
}
