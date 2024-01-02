export const config = {
  // set to true to run the cron job every 30 seconds
  debug: true,
  // cron expression to run the cron job every 30 seconds, see https://crontab.guru/ for more info
  cronExpression: "0 */5 * * *", // 5 hours
  // cronExpression: "0 */10 * * *", // 10 hours

  // time between calls to the Instagram API in seconds
  timeBetweenCalls: "1",

  // maximum number of users to add to the close friends list per run
  maxBestiesPerRun: 50,

  // file to store the IDs of the users that have already been added to the close friends list
  filePath: "besties.csv",

  // instagram credentials (optional)
  credentials: {
    username: "lucadardenne",
    password: "vandermirch99",
  },
};
