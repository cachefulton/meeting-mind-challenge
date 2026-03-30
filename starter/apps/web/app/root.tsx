import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from 'react-router';
import type { LinksFunction } from 'react-router';
import stylesheet from './app.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
];

function NavLoadingBar() {
  const navigation = useNavigation();
  if (navigation.state !== 'loading') return null;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-50 h-0.5 animate-pulse bg-indigo-600"
      aria-hidden
    />
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="relative border-b border-gray-200 bg-white">
          <NavLoadingBar />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <Link
                  to="/"
                  className="text-xl font-semibold hover:text-indigo-600 transition-colors"
                >
                  Meeting Mind
                </Link>
                <Link
                  to="/meetings"
                  className="hidden text-sm font-medium text-gray-600 hover:text-indigo-600 sm:inline"
                >
                  Meetings
                </Link>
              </div>
              <Link
                to="/meetings/new"
                className="inline-flex shrink-0 items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                + New Meeting
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
