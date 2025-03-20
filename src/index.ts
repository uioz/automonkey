import { NCWebsocket } from "node-napcat-ts";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    debug: {
      type: "boolean",
      short: "d",
      default: false,
    },
    group: {
      type: "string",
      short: "g",
    },
    userid: {
      type: "string",
      short: "u",
    },
    accessToken: {
      type: "string",
      short: "t",
    },
    baseUrl: {
      type: "string",
      short: "b",
    },
  },
});

for (const key of ["group", "userid", "baseUrl"] as const) {
  if (values[key] === undefined) {
    throw new Error(`args ${key} is required`);
  }
}

const napcat = new NCWebsocket(
  {
    baseUrl: values.baseUrl!,
    accessToken: values.accessToken!,
    throwPromise: true,
    reconnection: {
      enable: true,
      attempts: 10,
      delay: 5000,
    },
  },
  values.debug
);

const groups = new Set(values.group!.split(",").map(parseInt));
const monkeys = new Set(values.userid!.split(",").map(parseInt));

await napcat.connect();

// find the monkey emoji id
napcat.on("notice.group_msg_emoji_like", (response) => {
  for (const item of response.likes) {
    console.log(`emoji_id ${item.emoji_id}`);
  }
});

napcat.on("message.group", ({ group_id, message_id, user_id }) => {
  if (groups.has(group_id)) {
    if (monkeys.has(user_id)) {
      napcat.set_msg_emoji_like({
        message_id,
        emoji_id: "1f4a9",
      });
    }
  }
});
