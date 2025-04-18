import { Outlet, redirect } from "react-router";
import { AppBar } from "~/ui/AppBar";
import SideBar from "~/ui/SideBar";
import type { Route } from "./+types/layout";
import { getMailboxes } from "~/jmap";

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const mailboxes = await getMailboxes(params.id)
    if (!!params.mailboxId) {
      return { ok: true, data: mailboxes };
    } else {
      return redirect(
        `/${params.id}/${
          mailboxes.find((mb) => mb.name === "INBOX")?.id
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
