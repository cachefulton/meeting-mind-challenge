# Approach — Meeting Mind

I let AI take the wheel on a most of this. I spent a little time trying to familiarize myself with nest and the rest of your tech stack. My approach on using ai was to make a plan and then build parts of that plan at a time. 

## Key Technical Decisions

I kept the starter stack (NestJS, React Router v7, TypeORM, Postgres, Turborepo) intentionally— I'd rather show I can adapt to your tools than swap in something comfortable I already know. I extended `@meeting-mind/shared` as the single source of truth for all domain types so the API and frontend never guess at the same shapes.

For storage I used JSONB columns for nested extracted data. A normalized schema would be more textbook, but for this scope it would've added migrations and queries without much payoff. I also added `analysisStatus` and `analysisError` columns so a failed LLM call doesn't lose the transcript—the user sees what went wrong and can retry.

I chose google ai studio (`gemini-2.5-flash`). The SDK supports native JSON schema, so I get structured JSON back without fragile parsing. On the frontend, inline editing uses `useFetcher` for PATCH updates without full reloads, and the meetings list has search, date-range filtering, and sort to smooth out the front end.

## AI Integration

The system prompt carries most of the judgment: explicit rules for what counts as an action item versus a suggestion, a decision versus one person's opinion, venting versus actionable content, and when to omit an assignee rather than guess. I defined a Gemini response schema mirroring the shared TypeScript types exactly—summary, action items (assignee, priority), decisions (rationale), open questions, insights (category enum), sentiment, and participants.

After each response I validate with `isValidAnalysis()` and a check (long transcript but zero actions and zero decisions triggers a retry). Retries use exponential backoff with a max of two attempts—enough to handle flakes without overcomplicating things. I went beyond the baseline by adding insights, sentiment, and participants.


## Trade-offs

- Synchronous analysis on create. Simple and complete for this scale; for production I'd use a background queue.
- Single LLM provider. One provider with solid error handling beats a half-baked multi-provider abstraction.
- Selective editing. Title, summary, actions, decisions, and open questions are editable; insights and participants are read-only. Focused on the fields users would most likely correct.
- No tests. Time choice.

## What I'd Improve With More Time

An async analysis pipeline with a background worker and real-time status updates. Then single-meeting chat—the data's already stored, so a conversational endpoint is a natural extension. After that: tests (unit tests for DTOs and validation, fixture-based integration tests so CI doesn't need a live key), editable priority on action items, and better loading/error states everywhere.
