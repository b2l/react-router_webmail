const baseUrl = `https://127.0.0.1/jmap/`;

export async function getMailboxes(id: string) {
  const resp = await fetch(`${baseUrl}/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "post",
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [["Mailbox/get"]],
    }),
  });
  const json: JSONResponse<[MailboxMethodResponse]> = await resp.json();
  return json.methodResponses[0][1].list.map(
    ({ id, name, parentId, unreadEmails }) => ({
      id,
      name,
      parentId,
      unreadEmails,
    })
  );
}

export async function getThreads(accountId: string, mailboxId: string) {
  const resp = await fetch(`${baseUrl}/${accountId}`, {
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
            accountId: accountId,
            filter: {
              inMailbox: mailboxId,
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
            accountId: accountId,
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
            accountId: accountId,
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
            accountId: accountId,
            "#ids": {
              name: "Thread/get",
              path: "/list/*/emailIds",
              resultOf: "2",
            },
            properties: ["id", "from", "subject", "receivedAt"],
          },
          "3",
        ],
      ],
    }),
  });

  type Responses = [
    [name: "Email/query", response: Object, responseId: "0"],
    [name: "Email/get", reponse: Object, responseId: "1"],
    [name: "Threads/get", response: ThreadsResponse, responseId: "2"],
    [name: "Email/get", response: ThreadEmailsResponse, responseId: "3"]
  ];
  const json: JSONResponse<Responses> = await resp.json();
  const [emailName, emailsResponse, emailsResponseId] = json.methodResponses[3];
  const [threadsName, threadsResponse, threadsResponseId] =
    json.methodResponses[2];
  const threads: Threads = threadsResponse.list.map((thread) => ({
    ...thread,
    emails: thread.emailIds.map(
      (id) =>
        emailsResponse.list.find((email) => email.id === id) as ThreadEmail
    ),
  }));

  return threads;
}
export async function getThread(accountId: string, threadId: string) {
  const resp = await fetch(`${baseUrl}/${accountId}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "post",
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [
        [
          "Thread/get",
          {
            accountId: accountId,
            ids: [threadId],
          },
          "0",
        ],
        [
          "Email/get",
          {
            accountId: accountId,
            "#ids": {
              name: "Thread/get",
              path: "/list/*/emailIds",
              resultOf: "0",
            },
            properties: [
              "id",
              "from",
              "subject",
              "receivedAt",
              "blobId",
              "inReplyTo",
              "references",
              "from",
              "cc",
              "bcc",
              "replyTo",
              "sentAt",
              "bodyValues",
            ],
            fetchHTMLBodyValues: true,
          },
          "1",
        ],
      ],
    }),
  });

  type Responses = [
    [name: "Threads/get", response: ThreadsResponse, responseId: "0"],
    [
      name: "Email/get",
      response: EmailsResponse<{
        blobId: string;
        inReplyTo: string;
        references: string;
        sender: string;
        cc: string;
        bcc: string;
        replyTo: string;
        sentAt: string;
        htmlBody: string;
        bodyValues: string;
      }>,
      responseId: "1"
    ]
  ];
  const json: JSONResponse<Responses> = await resp.json();
  const [emailName, emailsResponse, emailsResponseId] = json.methodResponses[1];
  console.log(emailsResponse);
  //   return emailsResponse.list;
}

export type Thread = ThreadResponse & { emails: ThreadEmail[] };
export type Threads = Array<Thread>;

type JSONResponse<T> = {
  methodResponses: T;
};

type MailboxMethodResponse = [
  name: "Mailbox/get",
  response: MailboxResponse,
  responseId: string | null
];

type MailboxResponse = {
  accountId: string;
  list: Mailbox[];
  notFound: [];
  state: string;
};

type ThreadsResponse = {
  accountId: string;
  list: ThreadResponse[];
  notFound: [];
  state: string;
};

type ThreadResponse = {
  id: string;
  emailIds: string[];
};

type ThreadEmailsResponse = EmailsResponse<{}>;
type EmailsResponse<T> = {
  accountId: string;
  list: Email<T>[];
  notFound: [];
  state: string;
};
type ThreadEmail = Email<{}>;
type Email<T> = {
  id: string;
  receivedAt: string;
  from: Array<{ email: string; name: string | undefined } & T>;
  subject: string;
};

type Mailbox = {
  id: string;
  isSubscribed: boolean;
  myRight: string[];
  name: string;
  parentId: string | null;
  role: string | null;
  sortOrder: number;
  totalEmails: number;
  totalThreads: number;
  unreadEmails: number;
  unreadThreads: number;
};
