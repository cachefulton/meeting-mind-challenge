import { Link, useLoaderData } from 'react-router';
import type { MeetingSummary } from '@meeting-mind/shared';
import { getApiUrl } from '../api-url.server';
import { statusLabel, statusClass } from '../analysis-status';

export function meta() {
  return [{ title: 'Meetings — Meeting Mind' }];
}

export async function loader() {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/meetings`);
  if (!res.ok) {
    throw new Response('Failed to load meetings', { status: res.status });
  }
  const meetings = (await res.json()) as MeetingSummary[];
  return { meetings };
}

function formatOccurredAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(d);
}

export default function MeetingsIndex() {
  const { meetings } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Meetings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse processed transcripts and open a meeting for full detail.
          </p>
        </div>
        <Link
          to="/meetings/new"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          + New Meeting
        </Link>
      </div>

      {meetings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-base font-medium text-gray-900">No meetings yet</p>
          <p className="mt-2 text-sm text-gray-500">
            Create your first meeting from a pasted transcript to see it here.
          </p>
          <Link
            to="/meetings/new"
            className="mt-6 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            New Meeting
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pl-6"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:table-cell"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {meetings.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <Link
                      to={`/meetings/${m.id}`}
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      {m.title}
                    </Link>
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {formatOccurredAt(m.occurredAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(m.analysisStatus)}`}
                    >
                      {statusLabel(m.analysisStatus)}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-6">
                    <Link
                      to={`/meetings/${m.id}`}
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View<span className="sr-only">, {m.title}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
