import { Outlet, redirect } from "react-router";
import { AppBar } from "~/ui/AppBar";
import SideBar from "~/ui/SideBar";
import type { Route } from "./+types/layout";

export function HydrateFallback() {
  return <div>Loading... again</div>;
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
        methodCalls: [["Mailbox/get"]],
      }),
    });
    const { methodResponses } = await resp.json();
    const [, mailboxResponse] = methodResponses[0];

    if (!!params.mailboxId) {
      return { ok: true, data: mailboxResponse };
    } else {
      console.log(params)
      return redirect(
        `/${params.id}/${
          mailboxResponse.list.find((mb) => mb.name === "INBOX").id
        }`
      );
    }
  } catch (e) {
    return { ok: false, data: null };
  }
}

export default function Layout() {
  return (
    <>
      <AppBar />
      <div className="flex grow flex-row">
        <SideBar />
        <Outlet />
      </div>
    </>
  );
}
