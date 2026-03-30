import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, Meta, Links, Link, ScrollRestoration, Scripts, useNavigation, Form, redirect, useLoaderData } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const stylesheet = "/assets/app-DWRosLHk.css";
const links = () => [{
  rel: "stylesheet",
  href: stylesheet
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      className: "bg-gray-50 text-gray-900 min-h-screen",
      children: [/* @__PURE__ */ jsx("header", {
        className: "border-b border-gray-200 bg-white",
        children: /* @__PURE__ */ jsx("div", {
          className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
          children: /* @__PURE__ */ jsxs("div", {
            className: "flex h-16 items-center justify-between",
            children: [/* @__PURE__ */ jsx(Link, {
              to: "/",
              className: "text-xl font-semibold hover:text-indigo-600 transition-colors",
              children: "Meeting Mind"
            }), /* @__PURE__ */ jsx(Link, {
              to: "/meetings/new",
              className: "inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
              children: "+ New Meeting"
            })]
          })
        })
      }), /* @__PURE__ */ jsx("main", {
        className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8",
        children
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsxs("div", {
    className: "text-center py-20",
    children: [/* @__PURE__ */ jsx("h2", {
      className: "text-3xl font-bold tracking-tight text-gray-900",
      children: "Meeting Mind"
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-4 text-lg text-gray-600",
      children: "AI-powered meeting debrief tool."
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-2 text-sm text-gray-400",
      children: "This is a starter shell. Replace it with whatever UI you want — new routes, layouts, components. Make it yours."
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home
}, Symbol.toStringTag, { value: "Module" }));
function meta$1() {
  return [{
    title: "New Meeting — Meeting Mind"
  }];
}
async function action({
  request
}) {
  var _a, _b, _c;
  const formData = await request.formData();
  const title = ((_a = formData.get("title")) == null ? void 0 : _a.toString().trim()) ?? "";
  const occurredAt = ((_b = formData.get("occurredAt")) == null ? void 0 : _b.toString().trim()) ?? "";
  const transcriptText = ((_c = formData.get("transcriptText")) == null ? void 0 : _c.toString().trim()) ?? "";
  const errors = {};
  if (!title) errors.title = "Title is required.";
  if (!occurredAt) errors.occurredAt = "Date is required.";
  if (!transcriptText) errors.transcriptText = "Transcript text is required.";
  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: {
        title,
        occurredAt,
        transcriptText
      }
    };
  }
  const apiUrl = process.env.API_URL;
  const res = await fetch(`${apiUrl}/meetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title,
      occurredAt,
      transcriptText
    })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    let message = "Failed to create meeting.";
    if (body && typeof body.message === "string") {
      message = body.message;
    } else if (body && Array.isArray(body.message)) {
      message = body.message.join(", ");
    }
    return {
      errors: {
        form: message
      },
      values: {
        title,
        occurredAt,
        transcriptText
      }
    };
  }
  const meeting = await res.json();
  return redirect(`/meetings/${meeting.id}`);
}
const meetings_new = UNSAFE_withComponentProps(function NewMeeting({
  actionData
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const errors = actionData == null ? void 0 : actionData.errors;
  const values = actionData == null ? void 0 : actionData.values;
  return /* @__PURE__ */ jsxs("div", {
    className: "mx-auto max-w-2xl",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx(Link, {
        to: "/",
        className: "text-sm text-indigo-600 hover:text-indigo-500",
        children: "← Back to dashboard"
      }), /* @__PURE__ */ jsx("h2", {
        className: "mt-2 text-2xl font-bold tracking-tight text-gray-900",
        children: "New Meeting"
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-1 text-sm text-gray-500",
        children: "Paste a transcript and we'll extract a summary, action items, decisions, and open questions."
      })]
    }), (errors == null ? void 0 : errors.form) && /* @__PURE__ */ jsx("div", {
      className: "mb-6 rounded-md bg-red-50 p-4",
      children: /* @__PURE__ */ jsx("p", {
        className: "text-sm text-red-700",
        children: errors.form
      })
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      className: "space-y-6",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "title",
          className: "block text-sm font-medium text-gray-700",
          children: "Meeting title"
        }), /* @__PURE__ */ jsx("input", {
          type: "text",
          id: "title",
          name: "title",
          defaultValue: (values == null ? void 0 : values.title) ?? "",
          placeholder: "e.g. Sprint planning — March 30",
          className: `mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${(errors == null ? void 0 : errors.title) ? "border-red-300 text-red-900 placeholder-red-300" : "border-gray-300"}`
        }), (errors == null ? void 0 : errors.title) && /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-sm text-red-600",
          children: errors.title
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "occurredAt",
          className: "block text-sm font-medium text-gray-700",
          children: "Meeting date"
        }), /* @__PURE__ */ jsx("input", {
          type: "date",
          id: "occurredAt",
          name: "occurredAt",
          defaultValue: (values == null ? void 0 : values.occurredAt) ?? "",
          className: `mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${(errors == null ? void 0 : errors.occurredAt) ? "border-red-300 text-red-900" : "border-gray-300"}`
        }), (errors == null ? void 0 : errors.occurredAt) && /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-sm text-red-600",
          children: errors.occurredAt
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "transcriptText",
          className: "block text-sm font-medium text-gray-700",
          children: "Transcript"
        }), /* @__PURE__ */ jsx("textarea", {
          id: "transcriptText",
          name: "transcriptText",
          rows: 12,
          defaultValue: (values == null ? void 0 : values.transcriptText) ?? "",
          placeholder: "Paste the meeting transcript here…",
          className: `mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${(errors == null ? void 0 : errors.transcriptText) ? "border-red-300 text-red-900 placeholder-red-300" : "border-gray-300"}`
        }), (errors == null ? void 0 : errors.transcriptText) && /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-sm text-red-600",
          children: errors.transcriptText
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-end gap-3",
        children: [/* @__PURE__ */ jsx(Link, {
          to: "/",
          className: "text-sm font-medium text-gray-600 hover:text-gray-500",
          children: "Cancel"
        }), /* @__PURE__ */ jsx("button", {
          type: "submit",
          disabled: isSubmitting,
          className: "inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed",
          children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsxs("svg", {
              className: "mr-2 h-4 w-4 animate-spin text-white",
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              children: [/* @__PURE__ */ jsx("circle", {
                className: "opacity-25",
                cx: "12",
                cy: "12",
                r: "10",
                stroke: "currentColor",
                strokeWidth: "4"
              }), /* @__PURE__ */ jsx("path", {
                className: "opacity-75",
                fill: "currentColor",
                d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              })]
            }), "Analyzing…"]
          }) : "Create & Analyze"
        })]
      })]
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: meetings_new,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader({
  params
}) {
  const id = params.id;
  if (!id) throw new Response("Not Found", {
    status: 404
  });
  const apiUrl = process.env.API_URL;
  const res = await fetch(`${apiUrl}/meetings/${id}`);
  if (res.status === 404) throw new Response("Not Found", {
    status: 404
  });
  if (!res.ok) {
    throw new Response("Failed to load meeting", {
      status: res.status
    });
  }
  const meeting = await res.json();
  return {
    meeting
  };
}
function meta({
  loaderData
}) {
  var _a;
  const title = ((_a = loaderData == null ? void 0 : loaderData.meeting) == null ? void 0 : _a.title) ?? "Meeting";
  return [{
    title: `${title} — Meeting Mind`
  }];
}
function statusLabel(status) {
  switch (status) {
    case "completed":
      return "Analysis complete";
    case "failed":
      return "Analysis failed";
    default:
      return "Analyzing…";
  }
}
function statusClass(status) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-800 ring-emerald-600/20";
    case "failed":
      return "bg-red-50 text-red-800 ring-red-600/20";
    default:
      return "bg-amber-50 text-amber-800 ring-amber-600/20";
  }
}
const meetings_$id = UNSAFE_withComponentProps(function MeetingDetail() {
  const {
    meeting
  } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", {
    className: "mx-auto max-w-3xl",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx(Link, {
        to: "/",
        className: "text-sm text-indigo-600 hover:text-indigo-500",
        children: "← Back to dashboard"
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-4 flex flex-wrap items-start justify-between gap-4",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-2xl font-bold tracking-tight text-gray-900",
            children: meeting.title
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-1 text-sm text-gray-500",
            children: meeting.occurredAt
          })]
        }), /* @__PURE__ */ jsx("span", {
          className: `inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(meeting.analysisStatus)}`,
          children: statusLabel(meeting.analysisStatus)
        })]
      })]
    }), meeting.summary && /* @__PURE__ */ jsxs("section", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx("h2", {
        className: "text-sm font-semibold uppercase tracking-wide text-gray-500",
        children: "Summary"
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-2 whitespace-pre-wrap text-gray-800",
        children: meeting.summary
      })]
    }), meeting.actionItems.length > 0 && /* @__PURE__ */ jsxs("section", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx("h2", {
        className: "text-sm font-semibold uppercase tracking-wide text-gray-500",
        children: "Action items"
      }), /* @__PURE__ */ jsx("ul", {
        className: "mt-2 list-inside list-disc space-y-1 text-gray-800",
        children: meeting.actionItems.map((item, i) => /* @__PURE__ */ jsxs("li", {
          children: [item.text, item.assignee && /* @__PURE__ */ jsxs("span", {
            className: "text-gray-500",
            children: [" — ", item.assignee]
          })]
        }, i))
      })]
    }), meeting.decisions.length > 0 && /* @__PURE__ */ jsxs("section", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx("h2", {
        className: "text-sm font-semibold uppercase tracking-wide text-gray-500",
        children: "Decisions"
      }), /* @__PURE__ */ jsx("ul", {
        className: "mt-2 list-inside list-disc space-y-1 text-gray-800",
        children: meeting.decisions.map((d, i) => /* @__PURE__ */ jsx("li", {
          children: d.text
        }, i))
      })]
    }), meeting.openQuestions.length > 0 && /* @__PURE__ */ jsxs("section", {
      className: "mb-8",
      children: [/* @__PURE__ */ jsx("h2", {
        className: "text-sm font-semibold uppercase tracking-wide text-gray-500",
        children: "Open questions"
      }), /* @__PURE__ */ jsx("ul", {
        className: "mt-2 list-inside list-disc space-y-1 text-gray-800",
        children: meeting.openQuestions.map((q, i) => /* @__PURE__ */ jsx("li", {
          children: q.text
        }, i))
      })]
    }), /* @__PURE__ */ jsxs("section", {
      children: [/* @__PURE__ */ jsx("h2", {
        className: "text-sm font-semibold uppercase tracking-wide text-gray-500",
        children: "Transcript"
      }), /* @__PURE__ */ jsx("pre", {
        className: "mt-2 max-h-128 overflow-auto whitespace-pre-wrap rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-800",
        children: meeting.transcriptText
      })]
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: meetings_$id,
  loader,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-B37Zh8g_.js", "imports": ["/assets/chunk-UVKPFVEO-DwhDmhku.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/root-D5S1a6Qa.js", "imports": ["/assets/chunk-UVKPFVEO-DwhDmhku.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/home-DtPclRT-.js", "imports": ["/assets/chunk-UVKPFVEO-DwhDmhku.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/meetings.new": { "id": "routes/meetings.new", "parentId": "root", "path": "meetings/new", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/meetings.new-DP2hcDoK.js", "imports": ["/assets/chunk-UVKPFVEO-DwhDmhku.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/meetings.$id": { "id": "routes/meetings.$id", "parentId": "root", "path": "meetings/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/meetings._id-Bgo75w35.js", "imports": ["/assets/chunk-UVKPFVEO-DwhDmhku.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-9d1d0a0c.js", "version": "9d1d0a0c", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_passThroughRequests": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/meetings.new": {
    id: "routes/meetings.new",
    parentId: "root",
    path: "meetings/new",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/meetings.$id": {
    id: "routes/meetings.$id",
    parentId: "root",
    path: "meetings/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
