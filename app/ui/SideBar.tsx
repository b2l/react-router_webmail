import { Link, NavLink, useLoaderData, useParams } from "react-router";
import MenuItem from "./MenuItem";
import {
  ArchiveBoxIcon,
  DocumentIcon,
  FireIcon,
  InboxIcon,
  PaperAirplaneIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { loader } from "~/routes/layout";
import type { ReactNode } from "react";

export default function SideBar() {
  const params = useParams()
  const loaderData = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col w-50 gap-4 box-border">
      <NavLink className={({isActive}) => ([isActive ? 'bg-emerald-600' : ''].join(' '))} to="/a79d6550-196d-11f0-9a0b-34298f902313">nicolas@ling.fr</NavLink>
      <NavLink className={({isActive}) => ([isActive ? 'bg-emerald-600' : ''].join(' '))}to="/9f5de036-1b7f-11f0-9a0b-34298f902313">nicolas@cheneetcompagnie.fr</NavLink>
      <Link
        to="/compose"
        className="bg-amber-100 mx-3 flex items-center gap-0.5 p-1 text-emerald-950 no-underline rounded-xs"
      >
        New message
      </Link>

      <nav className="overflow-auto flex gap-2 flex-col">
        {loaderData.ok === false && (
          <div className="bg-rose-950 text-white">Something went wrong</div>
        )}
        {loaderData.ok &&
          loaderData.data.list.map((mailbox) => (
            <MenuItem to={`${mailbox.id}`} key={mailbox.id}>
              <MailboxMenu unread={Number(mailbox.unreadEmails)}>
                {mailbox.name.toLowerCase()}
              </MailboxMenu>
            </MenuItem>
          ))}
      </nav>
    </div>
  );
}

function MailboxMenu({ unread, children}: { unread: number, children: ReactNode }) {
  return (
    <div className="flex justify-between w-100">
      <div>{children}</div>
      { unread > 0 && <div className="bg-emerald-600 px-1.5 text-white rounded-3xl">{unread}</div>}
    </div>
  );
}
