import { getThread } from "~/jmap";
import type { Route } from "./+types/threadDetail";

export async function loader({ params }: Route.LoaderArgs) {
    return getThread(params.id, params.threadId)
}

export default function ThreadDetail({params, loaderData}: Route.ComponentProps) {
    return (
        <div>
            Detail of thread {params.threadId}

            {loaderData?.[0].subject}
        </div>
    ) 
}