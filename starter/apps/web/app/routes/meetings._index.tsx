import { useMemo, useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import type { MeetingSummary } from '@meeting-mind/shared';
import { Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
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

/** Local calendar date YYYY-MM-DD for range comparisons with `<input type="date">`. */
function localDateKey(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type DateSortMode = 'default' | 'desc' | 'asc';

function cycleDateSort(mode: DateSortMode): DateSortMode {
  if (mode === 'default') return 'desc';
  if (mode === 'desc') return 'asc';
  return 'default';
}

function occurredAtTime(iso: string) {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
}

function applyDateSort(
  list: MeetingSummary[],
  mode: DateSortMode,
): MeetingSummary[] {
  if (mode === 'default') return list;
  const out = [...list];
  out.sort((a, b) => {
    const ta = occurredAtTime(a.occurredAt);
    const tb = occurredAtTime(b.occurredAt);
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    const cmp = ta - tb;
    return mode === 'desc' ? -cmp : cmp;
  });
  return out;
}

function filterMeetings(
  meetings: MeetingSummary[],
  query: string,
  dateFrom: string,
  dateTo: string,
) {
  const q = query.trim().toLowerCase();
  let from = dateFrom || null;
  let to = dateTo || null;
  if (from && to && from > to) {
    const t = from;
    from = to;
    to = t;
  }

  return meetings.filter((m) => {
    if (q && !m.title.toLowerCase().includes(q)) return false;
    const key = localDateKey(m.occurredAt);
    if (!key) return true;
    if (from && key < from) return false;
    if (to && key > to) return false;
    return true;
  });
}

export default function MeetingsIndex() {
  const { meetings } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dateSort, setDateSort] = useState<DateSortMode>('default');

  const filteredMeetings = useMemo(
    () => filterMeetings(meetings, search, dateFrom, dateTo),
    [meetings, search, dateFrom, dateTo],
  );

  const displayMeetings = useMemo(
    () => applyDateSort(filteredMeetings, dateSort),
    [filteredMeetings, dateSort],
  );

  const hasActiveFilters =
    search.trim() !== '' || dateFrom !== '' || dateTo !== '';

  const clearFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
  };

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
          <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="meetings-search"
                  className="block text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  Search
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search className="h-4 w-4" aria-hidden strokeWidth={2} />
                  </span>
                  <input
                    id="meetings-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter by title…"
                    autoComplete="off"
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                <div>
                  <label
                    htmlFor="meetings-date-from"
                    className="block text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    From
                  </label>
                  <input
                    id="meetings-date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1.5 block w-full min-w-42 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-auto"
                  />
                </div>
                <div>
                  <label
                    htmlFor="meetings-date-to"
                    className="block text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    To
                  </label>
                  <input
                    id="meetings-date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1.5 block w-full min-w-42 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-auto"
                  />
                </div>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>
            {hasActiveFilters ? (
              <p className="mt-3 text-sm text-gray-600">
                Showing{' '}
                <span className="font-medium text-gray-900">
                  {filteredMeetings.length}
                </span>{' '}
                of {meetings.length} meeting
                {meetings.length === 1 ? '' : 's'}
              </p>
            ) : null}
          </div>

          {filteredMeetings.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-base font-medium text-gray-900">
                No meetings match your filters
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting the search or date range.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                      className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      <button
                        type="button"
                        onClick={() => setDateSort((m) => cycleDateSort(m))}
                        className="-mx-1 -my-1 inline-flex items-center gap-1 rounded-md px-1 py-1 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 transition-colors hover:bg-gray-200/80 hover:text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        aria-sort={
                          dateSort === 'desc'
                            ? 'descending'
                            : dateSort === 'asc'
                              ? 'ascending'
                              : 'none'
                        }
                        aria-label={
                          dateSort === 'default'
                            ? 'Date: click to sort newest first'
                            : dateSort === 'desc'
                              ? 'Date: sorted newest first, click for oldest first'
                              : 'Date: sorted oldest first, click to restore list order'
                        }
                        title={
                          dateSort === 'default'
                            ? 'Sort by date: newest first'
                            : dateSort === 'desc'
                              ? 'Sort by date: oldest first'
                              : 'Sort by date: original order'
                        }
                      >
                        <span>Date</span>
                        <span
                          className={`inline-flex items-center ${dateSort === 'default' ? 'text-gray-300' : 'text-indigo-600'}`}
                          aria-hidden
                        >
                          {dateSort === 'asc' ? (
                            <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                          ) : dateSort === 'desc' ? (
                            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                          )}
                        </span>
                      </button>
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
                  {displayMeetings.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <Link
                          to={`/meetings/${m.id}`}
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {m.title}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
      )}
    </div>
  );
}
