import fs from "fs";
import { config } from "../../config.js";
const { filePath, maxBestiesPerRun, timeBetweenCalls } = config;

export const logger = (message) =>
  console.log(
    `[${new Date().toLocaleString()}] [Sync with followers] ${message}`
  );

export const waitInSeconds = (seconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

export const readIdsFromFile = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    return fileContent.split(",").map((id) => parseInt(id.trim(), 10));
  } catch (error) {
    return [];
  }
};

export const isAnyIdIncludedInFile = (idsArray) => {
  const fileIds = readIdsFromFile(filePath);
  return idsArray.some((id) => fileIds.includes(id));
};

export const writeIdsToFile = (filePath, newIdsArray) => {
  if (newIdsArray.length === 0) return logger("No new IDs to append to file");
  try {
    const idsString = newIdsArray.join(",");
    const isAnyIdInFile = readIdsFromFile(filePath).length;
    fs.appendFileSync(filePath, (isAnyIdInFile ? "," : "") + idsString);
    logger(`IDs appended to file: ${filePath}`);
  } catch (error) {
    console.error("Error appending to file:", error.message);
  }
};

export const deleteAndCreateFile = async (filePath) => {
  try {
    // Check if the file exists
    await fs.promises.access(filePath, fs.constants.F_OK);
    // If the file exists, delete it
    await fs.promises.unlink(filePath);

    // Create an empty file
    await fs.promises.writeFile(filePath, "");

    logger(`Created: ${filePath}`);
  } catch (error) {}
};

export const chunkArray = (array, chunkSize) => {
  const chunked = [];
  for (let i = 0; i < array.length; i++) {
    const lastChunk = chunked[chunked.length - 1];
    if (!lastChunk || lastChunk.length === chunkSize) {
      chunked.push([array[i]]);
    } else {
      lastChunk.push(array[i]);
    }
  }
  return chunked;
};

export async function addBesties(ig, followersIds) {
  logger(`Adding ${followersIds.length} new followers to besties`);

  for (const chunk of chunkArray(followersIds, maxBestiesPerRun)) {
    await ig.friendship.setBesties({
      add: chunk,
      remove: [],
    });

    logger(`${chunk.length} new followers added to besties`);

    await waitInSeconds(timeBetweenCalls);
  }
}
