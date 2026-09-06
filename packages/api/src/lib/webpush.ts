import webpush from "web-push";
import { env, webPushEnabled } from "../config/env.js";

if (webPushEnabled) {
  webpush.setVapidDetails(
    env.VAPID_SUBJECT as string,
    env.VAPID_PUBLIC_KEY as string,
    env.VAPID_PRIVATE_KEY as string,
  );
}

export { webpush, webPushEnabled };
