import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index('routes/home.tsx'),
  route("/:id", "routes/layout.tsx", [
    route(":mailboxId", "routes/mailbox.tsx", [
      route(":threadId", "routes/threadDetail.tsx")
    ]),
  ]),
] satisfies RouteConfig;
