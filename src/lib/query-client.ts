import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from "@tanstack/react-query";

/** A non-2xx response from our own API. Carries the status so retry logic and
 *  error boundaries can tell "you typed it wrong" from "the server fell over". */
export class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // A 404 or a 400 will not become a 200 by asking again.
          if (error instanceof HttpError && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      dehydrate: {
        // Pending queries are dehydrated too, so a Server Component can start a
        // fetch, stream the shell, and let the client pick up the same promise.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * On the server: a fresh client per request, so one visitor's cache is never
 * another's. In the browser: one client for the life of the tab.
 */
export function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
