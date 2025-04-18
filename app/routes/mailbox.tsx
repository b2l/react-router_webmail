import { useLoaderData } from "react-router";
import type { Route } from "./+types/mailbox";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Envoy - Inbox" },
    { name: "description", content: "Welcome to the future" },
  ];
}
const baseUrl = `https://127.0.0.1/jmap/`;

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const resp = await fetch(`${baseUrl}/${params.id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
      body: JSON.stringify({
        using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
        methodCalls: [
          // First we do a query for the id of first 10 messages in the mailbox
          [
            "Email/query",
            {
              accountId: params.id,
              filter: {
                inMailbox: params.mailboxId,
              },
              sort: [{ property: "receivedAt", isAscending: false }],
              position: 0,
              collapseThreads: true,
              limit: 20,
              calculateTotal: true,
            },
            "0",
          ],

          // Then we fetch the threadId of each of those messages
          [
            "Email/get",
            {
              accountId: params.id,
              "#ids": {
                name: "Email/query",
                path: "/ids",
                resultOf: "0",
              },
              properties: ["threadId"],
            },
            "1",
          ],

          // Next we get the emailIds of the messages in those threads
          [
            "Thread/get",
            {
              accountId: params.id,
              "#ids": {
                name: "Email/get",
                path: "/list/*/threadId",
                resultOf: "1",
              },
            },
            "2",
          ],

          // Finally we get the data for all those emails
          [
            "Email/get",
            {
              accountId: params.id,
              "#ids": {
                name: "Thread/get",
                path: "/list/*/emailIds",
                resultOf: "2",
              },
              properties: [
                "id",
                "from",
                "subject",
                "receivedAt"
              ],
            },
            "3",
          ],
        ],
      }),
    });
    const { methodResponses } = await resp.json();
    const [, threads] = methodResponses.find(([, , callId]) => callId === "2");
    const [, emails] = methodResponses.find(([, , callId]) => callId === "3");

    const t = threads.list.map((thread) => {
      const newThread = {
        ...thread,
        emails: thread.emailIds.map((id) => {
          const email = emails.list.find((email) => {
            return email.id === id;
          });
          return email;
        }),
      };
      return newThread;
    });
    // const threads = threadList.map(thread => thread.emails = thread.emailIds.map(id => emails.find(email => email.id === id)))
    // return { threads: threads.list, emails: emails.list };
    return { threads: t, emails: [] };
  } catch (e) {
    return { ok: false, data: null };
  }
}

export default function Mailbox({ loaderData }: Route.ComponentProps) {
  return (
    <main className="flex grow flex-col bg-white text-black">
      <div className="h-12 flex border-b-2 border-emerald-950">
        Mail context Toolbar
      </div>
      <div className="flex col-2">
        <div className="flex flex-col border-r-2">
          {loaderData.threads.map((thread) => (
            <Thread thread={thread} />
          ))}
        </div>
      </div>
    </main>
  );
}

function Thread({ thread }) {
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
      <div className="text-emerald-950">{fromString} {emails.length > 3 && `(${emails.length})`}</div>
      <div>{subject}</div>
      <div>{thread.emails[0].receivedAt}</div>
    </div>
  );
}
