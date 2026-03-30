import { Form, redirect, useActionData, useNavigation, Link } from 'react-router';
import type { Route } from './+types/meetings.new';
import { getApiUrl } from '../api-url.server';

export function meta() {
  return [{ title: 'New Meeting — Meeting Mind' }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get('title')?.toString().trim() ?? '';
  const occurredAt = formData.get('occurredAt')?.toString().trim() ?? '';
  const transcriptText = formData.get('transcriptText')?.toString().trim() ?? '';

  const errors: Record<string, string> = {};
  if (!title) errors.title = 'Title is required.';
  if (!occurredAt) errors.occurredAt = 'Date is required.';
  if (!transcriptText) errors.transcriptText = 'Transcript text is required.';

  if (Object.keys(errors).length > 0) {
    return { errors, values: { title, occurredAt, transcriptText } };
  }

  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, occurredAt, transcriptText }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    let message = 'Failed to create meeting.';
    if (body && typeof body.message === 'string') {
      message = body.message;
    } else if (body && Array.isArray(body.message)) {
      message = (body.message as string[]).join(', ');
    }
    return {
      errors: { form: message },
      values: { title, occurredAt, transcriptText },
    };
  }

  const meeting = (await res.json()) as { id: string };
  return redirect(`/meetings/${meeting.id}`);
}

export default function NewMeeting({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors as Record<string, string> | undefined;
  const values = actionData?.values as Record<string, string> | undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          to="/meetings"
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          &larr; All meetings
        </Link>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          New Meeting
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Paste a transcript and we'll extract a summary, action items,
          decisions, and open questions.
        </p>
      </div>

      {errors?.form && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{errors.form}</p>
        </div>
      )}

      <Form method="post" className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Meeting title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={values?.title ?? ''}
            placeholder="e.g. Sprint planning — March 30"
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${
              errors?.title
                ? 'border-red-300 text-red-900 placeholder-red-300'
                : 'border-gray-300'
            }`}
          />
          {errors?.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="occurredAt"
            className="block text-sm font-medium text-gray-700"
          >
            Meeting date
          </label>
          <input
            type="date"
            id="occurredAt"
            name="occurredAt"
            defaultValue={values?.occurredAt ?? ''}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${
              errors?.occurredAt
                ? 'border-red-300 text-red-900'
                : 'border-gray-300'
            }`}
          />
          {errors?.occurredAt && (
            <p className="mt-1 text-sm text-red-600">{errors.occurredAt}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="transcriptText"
            className="block text-sm font-medium text-gray-700"
          >
            Transcript
          </label>
          <textarea
            id="transcriptText"
            name="transcriptText"
            rows={12}
            defaultValue={values?.transcriptText ?? ''}
            placeholder="Paste the meeting transcript here…"
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${
              errors?.transcriptText
                ? 'border-red-300 text-red-900 placeholder-red-300'
                : 'border-gray-300'
            }`}
          />
          {errors?.transcriptText && (
            <p className="mt-1 text-sm text-red-600">
              {errors.transcriptText}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/meetings"
            className="text-sm font-medium text-gray-600 hover:text-gray-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing…
              </>
            ) : (
              'Create & Analyze'
            )}
          </button>
        </div>
      </Form>
    </div>
  );
}
