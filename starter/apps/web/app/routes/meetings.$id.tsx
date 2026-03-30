import { useState, useRef, useEffect } from 'react';
import { Link, useLoaderData, useFetcher, redirect } from 'react-router';
import { AnalysisStatus, type Meeting } from '@meeting-mind/shared';
import type { Route } from './+types/meetings.$id';
import { getApiUrl } from '../api-url.server';
import { statusLabel, statusClass } from '../analysis-status';

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id;
  if (!id) throw new Response('Not Found', { status: 404 });

  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/meetings/${id}`);
  if (res.status === 404) throw new Response('Not Found', { status: 404 });
  if (!res.ok) {
    throw new Response('Failed to load meeting', { status: res.status });
  }

  const meeting = (await res.json()) as Meeting;
  return { meeting };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent')?.toString();
  const apiUrl = getApiUrl();

  if (intent === 'retry') {
    const res = await fetch(`${apiUrl}/meetings/${params.id}/retry`, {
      method: 'POST',
    });
    if (!res.ok) return { error: 'Retry failed. Please try again.' };
    return redirect(`/meetings/${params.id}`);
  }

  const title = formData.get('title')?.toString().trim();
  if (!title) return { error: 'Title cannot be empty.' };

  const res = await fetch(`${apiUrl}/meetings/${params.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) return { error: 'Failed to update title.' };
  return { ok: true };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const title = loaderData?.meeting?.title ?? 'Meeting';
  return [{ title: `${title} — Meeting Mind` }];
}

function EditableTitle({ initialTitle }: { initialTitle: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher();

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed || trimmed === initialTitle) {
      setTitle(initialTitle);
      setIsEditing(false);
      return;
    }
    fetcher.submit({ title: trimmed }, { method: 'PATCH' });
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setTitle(initialTitle);
              setIsEditing(false);
            }
          }}
          onBlur={handleSave}
          className="rounded-md border border-gray-300 px-2 py-1 text-2xl font-bold tracking-tight text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        {title}
      </h1>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-600 group-hover:opacity-100"
        aria-label="Edit title"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
        </svg>
      </button>
    </div>
  );
}

function FailedAnalysisBanner({ error }: { error: string | null }) {
  const fetcher = useFetcher();
  const isRetrying = fetcher.state !== 'idle';

  return (
    <div className="mb-8 rounded-md border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0 text-red-400">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Analysis failed
          </h3>
          <p className="mt-1 text-sm text-red-700">
            We couldn't analyze this transcript. This is usually a temporary issue — try again in a moment.
          </p>
          {error && (
            <pre className="mt-2 whitespace-pre-wrap rounded bg-red-100 px-3 py-2 text-xs text-red-800">
              {error}
            </pre>
          )}
          <fetcher.Form method="post" className="mt-3">
            <input type="hidden" name="intent" value="retry" />
            <button
              type="submit"
              disabled={isRetrying}
              className="inline-flex items-center rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 ring-1 ring-inset ring-red-200 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? (
                <>
                  <svg className="mr-1.5 h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Retrying…
                </>
              ) : (
                'Retry Analysis'
              )}
            </button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
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
            <EditableTitle initialTitle={meeting.title} />
            <p className="mt-1 text-sm text-gray-500">
              {meeting.occurredAt}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(meeting.analysisStatus)}`}
          >
            {statusLabel(meeting.analysisStatus, 'long')}
          </span>
        </div>
      </div>

      {meeting.analysisStatus === AnalysisStatus.Failed && (
        <FailedAnalysisBanner error={meeting.analysisError} />
      )}

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

      {(meeting.actionItems ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Action items
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-800">
            {(meeting.actionItems ?? []).map((item, i) => (
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

      {(meeting.decisions ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Decisions
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-800">
            {(meeting.decisions ?? []).map((d, i) => (
              <li key={i}>{d.text}</li>
            ))}
          </ul>
        </section>
      )}

      {(meeting.openQuestions ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Open questions
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-800">
            {(meeting.openQuestions ?? []).map((q, i) => (
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
