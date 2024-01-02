export const config = {
  /**
   * If set to true the cron job will run every 30 seconds
   */
  debug: false,
  /**
   * Specify the cron expression for the cron job, see https://crontab.guru/ for help
   */
  cronExpression: "0 */5 * * *", // 5 hours
  /**
   * Time between calls to the Instagram API in seconds
   */
  timeBetweenCalls: "1",
  /**
   * Maximum number of users to add to the close friends list per iteration,
   * this is to avoid Instagram's rate limit, be careful not to set it too high
   */
  maxBestiesPerRun: 50,
  /**
   * File to store the IDs of the users that have already been added to the close friends list
   */
  filePath: "besties.csv",

  /**
   * Your Instagram credentials
   */
  credentials: {
    username: "",
    password: "",
  },
};
