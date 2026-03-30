import {
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from 'react-router';
import { ChevronDown } from 'lucide-react';
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
              <Link
                to="/"
                className="text-xl font-semibold text-gray-900 transition-colors hover:text-indigo-600"
              >
                Meeting Mind
              </Link>
              <div className="flex items-center gap-1 sm:hidden">
                <Link
                  to="/meetings"
                  className="rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-indigo-600"
                >
                  All meetings
                </Link>
                <Link
                  to="/meetings/new"
                  className="rounded-lg px-2.5 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                >
                  New meeting
                </Link>
              </div>
              <div className="group relative hidden sm:block">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  aria-haspopup="menu"
                >
                  Meetings
                  <ChevronDown
                    className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180 group-hover:text-indigo-500"
                    aria-hidden
                    strokeWidth={2}
                  />
                </button>
                <div
                  className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="min-w-50 overflow-hidden rounded-xl border border-gray-200/80 bg-white py-1 shadow-lg shadow-gray-900/5 ring-1 ring-black/4">
                    <NavLink
                      to="/meetings"
                      end
                      role="menuitem"
                      className={({ isActive }) =>
                        [
                          'block px-4 py-2.5 text-sm transition-colors',
                          isActive
                            ? 'bg-indigo-50 font-medium text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                        ].join(' ')
                      }
                    >
                      All meetings
                    </NavLink>
                    <NavLink
                      to="/meetings/new"
                      role="menuitem"
                      className={({ isActive }) =>
                        [
                          'block px-4 py-2.5 text-sm transition-colors',
                          isActive
                            ? 'bg-indigo-50 font-medium text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                        ].join(' ')
                      }
                    >
                      New meeting
                    </NavLink>
                  </div>
                </div>
              </div>
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
