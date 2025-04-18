import { Link, Outlet, useLoaderData } from "react-router";
import type { Route } from "./+types/mailbox";
import { getThreads, type Thread, type Threads } from "~/jmap";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Envoy - Inbox" },
    { name: "description", content: "Welcome to the future" },
  ];
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export async function loader({ params }: Route.LoaderArgs) {
  return await getThreads(params.id, params.mailboxId);
}

export default function Mailbox({ loaderData }: Route.ComponentProps) {
  return (
    <main className="flex grow flex-col bg-white text-black">
      <div className="h-12 flex border-b-2 border-emerald-950">
        Mail context Toolbar
      </div>
      <div className="flex col-2">
        <div className="flex flex-col border-r-2">
          <ThreadList threads={loaderData} />
        </div>
        <div className="flex flex-col">
          <Outlet />
        </div>
      </div>
    </main>
  );
}

function ThreadList({ threads }: { threads: Threads }) {
  return threads.map((thread) => <Thread thread={thread} />);
}

function Thread({ thread }: { thread: Thread }) {
  const { emails } = thread;
  const fromString =
    emails.length > 3
      ? `${emails[0].from[0].name}${emails[1].from[0].name}...${
          emails.slice(-1)[0].from[0].name
        }`
      : emails
          .map((email) => email.from[0].name || email.from[0].email)
          .join(" ");
  const subject = emails[0].subject;

  return (
    <div className="flex flex-col py-1 border-b-1 border-gray-100">
      <Link to={thread.id}>
        <div className="text-emerald-950">
          {fromString} {emails.length > 3 && `(${emails.length})`}
        </div>
        <div>{subject}</div>
        <div>{thread.emails[0].receivedAt}</div>
      </Link>
    </div>
  );
}
