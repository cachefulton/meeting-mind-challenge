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
          priority: {
            type: SchemaType.STRING,
            format: 'enum',
            enum: ['high', 'medium', 'low'],
            description:
              'high = has a deadline or blocks others; medium = committed but no urgency; low = stretch goal or "if time allows."',
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
          rationale: {
            type: SchemaType.STRING,
            description:
              'A brief explanation of why this was decided. Omit if the reasoning is not discussed.',
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
    insights: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: {
            type: SchemaType.STRING,
            description: 'A higher-order observation about the meeting.',
          },
          category: {
            type: SchemaType.STRING,
            format: 'enum',
            enum: ['theme', 'risk', 'observation', 'follow-up'],
            description:
              'theme = recurring topic; risk = concern raised; observation = notable dynamic; follow-up = recommended next step not explicitly stated.',
          },
        },
        required: ['text', 'category'],
      },
      description:
        '3-6 higher-order observations: recurring themes, risks, notable dynamics, and recommended follow-ups.',
    },
    sentiment: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['productive', 'contentious', 'exploratory', 'neutral'],
      description:
        'Overall meeting tone. productive = clear outcomes and forward momentum; contentious = significant disagreement; exploratory = brainstorming without convergence; neutral = status update or routine.',
    },
    participants: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: {
            type: SchemaType.STRING,
            description: 'Full name of the participant.',
          },
          role: {
            type: SchemaType.STRING,
            description:
              'Inferred role based on contributions (e.g. "facilitator", "technical lead", "designer"). Omit if unclear.',
          },
        },
        required: ['name'],
      },
      description: 'Every speaker identified in the transcript with their inferred role.',
    },
  },
  required: [
    'title',
    'summary',
    'actionItems',
    'decisions',
    'openQuestions',
    'insights',
    'sentiment',
    'participants',
  ],
};

const SYSTEM_PROMPT = `You are an expert meeting-analysis assistant. Given a raw meeting transcript, extract structured, actionable data. Follow these rules precisely:

## Title & Summary
- Title: a short, descriptive title (max 10 words) capturing the main topic.
- Summary: 2-4 sentences capturing the essence — what was discussed, what was decided, and what remains open.

## Action Items
- Only extract items where someone explicitly commits ("I'll do X"), volunteers, is directly assigned and accepts, or is asked and agrees.
- Phrases like "maybe we should", "it would be nice if", or "we could" are suggestions, NOT action items — capture these as insights or open questions instead.
- Assignee: include only when the owner is stated or clearly implied by the speaker volunteering. Do not guess.
- Priority: high if it has a deadline, blocks others, or is called out as urgent; medium if committed but no urgency; low if described as stretch, optional, or "if time allows."

## Decisions
- A decision requires group convergence — look for confirmation signals: multiple people agreeing, "let's go with that", "sounds good", explicit approval.
- One person's opinion or preference is discussion, not a decision.
- Include a brief rationale capturing WHY it was decided when the reasoning is discussed.

## Open Questions
- Items explicitly deferred, left unanswered, or flagged for follow-up.
- Topics where the group debated but did not converge.
- Do NOT include questions that were asked and answered during the meeting.

## Insights
- Extract 3-6 higher-order observations that go beyond summarizing what was said.
- Categories: "theme" for recurring topics, "risk" for concerns raised, "observation" for notable dynamics (e.g. one person carrying most of the load, team alignment issues), "follow-up" for recommended next steps not explicitly stated.

## Sentiment
- Characterize the overall meeting tone: productive (clear outcomes, forward momentum), contentious (significant disagreement or tension), exploratory (brainstorming without convergence), neutral (routine updates).

## Participants
- Extract every speaker with an inferred role based on their contributions (e.g. "facilitator", "technical lead", "product manager", "designer").

## General Rules
- Be thorough but avoid duplicating the same point across sections.
- Prefer precision over recall — omit uncertain items rather than guessing.
- Distinguish emotional venting or praise from actionable content. Frustration and praise inform sentiment and insights, not action items.`;

const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1000;

function isValidAnalysis(parsed: unknown): parsed is AnalysisResult {
  if (!parsed || typeof parsed !== 'object') return false;
  const p = parsed as Record<string, unknown>;
  return (
    typeof p.title === 'string' &&
    !!p.title &&
    typeof p.summary === 'string' &&
    !!p.summary &&
    Array.isArray(p.actionItems) &&
    Array.isArray(p.decisions) &&
    Array.isArray(p.openQuestions) &&
    Array.isArray(p.insights) &&
    typeof p.sentiment === 'string' &&
    Array.isArray(p.participants)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  async analyze(
    transcript: string,
    attempt = 1,
  ): Promise<AnalysisResult> {
    this.logger.log(
      `Starting Gemini analysis (attempt ${attempt}/${MAX_RETRIES})…`,
    );

    let text: string;
    try {
      const result = await this.model.generateContent(
        `Analyze the following meeting transcript:\n\n${transcript}`,
      );
      text = result.response.text();
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        this.logger.warn(
          `Gemini API call failed (attempt ${attempt}), retrying in ${delay}ms…`,
          err instanceof Error ? err.message : err,
        );
        await sleep(delay);
        return this.analyze(transcript, attempt + 1);
      }
      throw err;
    }

    let parsed: AnalysisResult;
    try {
      parsed = JSON.parse(text) as AnalysisResult;
    } catch {
      if (attempt < MAX_RETRIES) {
        this.logger.warn(
          `Attempt ${attempt} returned non-JSON response, retrying…`,
        );
        return this.analyze(transcript, attempt + 1);
      }
      this.logger.error('Gemini returned non-JSON response after retries', text);
      throw new Error('AI analysis returned an invalid response.');
    }

    if (!isValidAnalysis(parsed)) {
      if (attempt < MAX_RETRIES) {
        this.logger.warn(
          `Attempt ${attempt} produced incomplete result, retrying…`,
        );
        return this.analyze(transcript, attempt + 1);
      }
      this.logger.error('Gemini response missing required fields after retries', parsed);
      throw new Error('AI analysis response is missing required fields.');
    }

    if (
      transcript.length > 500 &&
      parsed.actionItems.length === 0 &&
      parsed.decisions.length === 0
    ) {
      if (attempt < MAX_RETRIES) {
        this.logger.warn(
          'Analysis returned no action items or decisions on a substantial transcript, retrying…',
        );
        return this.analyze(transcript, attempt + 1);
      }
    }

    this.logger.log(
      `Analysis complete — ${parsed.actionItems.length} action items, ` +
        `${parsed.decisions.length} decisions, ${parsed.openQuestions.length} open questions, ` +
        `${parsed.insights.length} insights, sentiment: ${parsed.sentiment}, ` +
        `${parsed.participants.length} participants`,
    );

    return parsed;
  }
}
