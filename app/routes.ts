import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index('routes/home.tsx'),
  route("/:id", "routes/layout.tsx", [
    route(":mailboxId", "routes/mailbox.tsx"),
  ]),
] satisfies RouteConfig;
