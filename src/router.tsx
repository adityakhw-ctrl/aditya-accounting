import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { trpc, createTRPCClient } from "./providers/trpc";

export const getRouter = () => {
  const queryClient = new QueryClient();
  const trpcClient = createTRPCClient();

  const router = createRouter({
    routeTree,
    context: { queryClient, trpcClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    Wrap: ({ children }) => (
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </trpc.Provider>
    ),
  });

  return router;
};
