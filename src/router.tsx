import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { PublicRouteError } from "./components/PublicRouteError";

export const getRouter = () => {
  // Short default staleTime so data rendered on the server isn't immediately re-fetched after load.
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: PublicRouteError,
    dehydrate: () => ({ queryState: JSON.stringify(dehydrate(queryClient, { shouldDehydrateMutation: () => false, shouldDehydrateQuery: (query) => query.state.status === 'success' && query.queryKey[0] !== 'public-detail' })) }),
    hydrate: (data) => { hydrate(queryClient, JSON.parse(data.queryState)); },
  });

  return router;
};
