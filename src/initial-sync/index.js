import {
  waitInSeconds,
  writeIdsToFile,
  logger,
  deleteAndCreateFile,
  chunkArray,
} from "../utils/functions.js";
import { config } from "../../config.js";

const { filePath, timeBetweenCalls, maxBestiesPerRun } = config;

export default async function (ig, loggedInUser) {
  // Schedule the cron job to run every hour
  logger(
    "Initializing sync with all followers... (Relax, this may take a while)"
  );
  deleteAndCreateFile(filePath);
  const followers = await retrieveAllFollowers(ig, loggedInUser);
  const followersIds = followers.map((follower) => follower.pk);
  writeIdsToFile(filePath, followersIds);

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

    await waitInSeconds(timeBetweenCalls);
  } while (followersFeed.isMoreAvailable());

  logger(`Retrieved ${followers.length} followers`);

  return followers;
}
