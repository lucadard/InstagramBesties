import {
  wait,
  writeIdsToFile,
  logger,
  deleteAndCreateFile,
} from "../utils/functions.js";
import { addBesties } from "../utils/functions.js";

export default async function (ig, loggedInUser) {
  // Schedule the cron job to run every hour
  logger(
    "Initializing sync with all followers... (Relax, this may take a while)"
  );
  deleteAndCreateFile();
  const followers = await retrieveAllFollowers(ig, loggedInUser);
  const followersIds = followers.map((follower) => follower.pk);
  writeIdsToFile(followersIds);

  await addBesties(ig, followersIds);
  logger("Sync with all followers completed!");
}

async function retrieveAllFollowers(ig, loggedInUser) {
  const followersFeed = ig.feed.accountFollowers({
    id: loggedInUser.pk,
  });

  let followers = [];
  do {
    const items = await followersFeed.items();
    followers = [...followers, ...items];

    await wait();
  } while (followersFeed.isMoreAvailable());

  logger(`Retrieved ${followers.length} followers`);

  return followers;
}
