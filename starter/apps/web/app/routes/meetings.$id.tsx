import { Link, useLoaderData } from 'react-router';
import type { Meeting } from '@meeting-mind/shared';
import type { Route } from './+types/meetings.$id';

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id;
  if (!id) throw new Response('Not Found', { status: 404 });

  const apiUrl = process.env.API_URL;
  const res = await fetch(`${apiUrl}/meetings/${id}`);
  if (res.status === 404) throw new Response('Not Found', { status: 404 });
  if (!res.ok) {
    throw new Response('Failed to load meeting', { status: res.status });
  }

  const meeting = (await res.json()) as Meeting;
  return { meeting };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const title = loaderData?.meeting?.title ?? 'Meeting';
  return [{ title: `${title} — Meeting Mind` }];
}

function statusLabel(status: Meeting['analysisStatus']) {
  switch (status) {
    case 'completed':
      return 'Analysis complete';
    case 'failed':
      return 'Analysis failed';
    default:
      return 'Analyzing…';
  }
}

function statusClass(status: Meeting['analysisStatus']) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-600/20';
    case 'failed':
      return 'bg-red-50 text-red-800 ring-red-600/20';
    default:
      return 'bg-amber-50 text-amber-800 ring-amber-600/20';
  }
}

export default function MeetingDetail() {
  const { meeting } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link
          to="/meetings"
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          &larr; All meetings
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {meeting.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {meeting.occurredAt}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(meeting.analysisStatus)}`}
          >
            {statusLabel(meeting.analysisStatus)}
          </span>
        </div>
      </div>

      {meeting.summary && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Summary
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-gray-800">
            {meeting.summary}
          </p>
        </section>
      )}

      {meeting.actionItems.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Action items
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-800">
            {meeting.actionItems.map((item, i) => (
              <li key={i}>
                {item.text}
                {item.assignee && (
                  <span className="text-gray-500"> — {item.assignee}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {meeting.decisions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Decisions
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-800">
            {meeting.decisions.map((d, i) => (
              <li key={i}>{d.text}</li>
            ))}
          </ul>
        </section>
      )}

      {meeting.openQuestions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Open questions
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-800">
            {meeting.openQuestions.map((q, i) => (
              <li key={i}>{q.text}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Transcript
        </h2>
        <pre className="mt-2 max-h-128 overflow-auto whitespace-pre-wrap rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-800">
          {meeting.transcriptText}
        </pre>
      </section>
    </div>
  );
}
