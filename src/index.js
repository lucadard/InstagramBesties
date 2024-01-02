import { IgApiClient } from "instagram-private-api";
import readline from "readline-sync";
import cron from "node-cron";
import initialSync from "./initial-sync/index.js";
import {
  waitInSeconds,
  writeIdsToFile,
  logger,
  isAnyIdIncludedInFile,
  addBesties,
} from "./utils/functions.js";
import { config } from "../config.js";
import { DEBUG_CRON_EXPRESSION } from "./utils/constants.js";

const { debug, cronExpression, filePath, timeBetweenCalls, credentials } =
  config;

// Create an instance of the Instagram Private API client
const ig = new IgApiClient();
let loggedInUser;

// Run the main function
(async () => {
  try {
    // Ask for username and password
    const username =
      credentials.username || readline.question("Enter your username: ");
    const password =
      credentials.password ||
      readline.question("Enter your password: ", {
        hideEchoBack: true, // Hide user input for passwords
      });
    ig.state.generateDevice(username);
    loggedInUser = await ig.account.login(username, password);
    await ig.account.currentUser();
    logger("Instagram Logged in");

    const runInitialSync = readline.question("Run initial sync? (y/n): ");
    if (runInitialSync === "y") {
      await initialSync(ig, loggedInUser);
    }
    runJob(ig, loggedInUser);
  } catch (error) {
    console.error(error);
  }
})();

function runJob(ig, loggedInUser) {
  logger("Initializing sync with recent followers...");

  cron.schedule(debug ? DEBUG_CRON_EXPRESSION : cronExpression, () => {
    syncWithFollowers(ig, loggedInUser);
  });
}

async function syncWithFollowers(ig, loggedInUser) {
  logger("Running sync");

  const followers = await retrieveLastHourFollowers(ig, loggedInUser);
  const followersIds = followers.map((follower) => follower.pk);
  await addBesties(ig, followersIds);
  writeIdsToFile(filePath, followersIds);
}

async function retrieveLastHourFollowers(ig, loggedInUser) {
  const followersFeed = ig.feed.accountFollowers({
    order: "date_followed_desc",
    id: loggedInUser.pk,
  });

  let followers = [];
  do {
    const items = await followersFeed.items();
    const newFollowers = items.filter(
      (follower) => !isAnyIdIncludedInFile([follower.pk], filePath)
    );
    followers = [...followers, ...newFollowers];

    await waitInSeconds(timeBetweenCalls);
  } while (followersFeed.isMoreAvailable());

  logger(`Retrieved ${followers.length} followers`);
  return followers;
}
