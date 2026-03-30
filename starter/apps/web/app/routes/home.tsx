import { Link } from 'react-router';

export default function Home() {
  return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900">
        Meeting Mind
      </h2>
      <p className="mt-4 text-lg text-gray-600">
        AI-powered meeting debrief tool.
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Paste a transcript, get a summary, action items, decisions, and open
        questions.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/meetings"
          className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          View meetings
        </Link>
        <Link
          to="/meetings/new"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          New meeting
        </Link>
      </div>
    </div>
  );
}
