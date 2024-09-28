import fs from 'fs';
import csvParser from 'csv-parser';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

console.time('Execution time')

const animeFileReadable = fs.createReadStream('./src/files/anime.csv');
const ratingFileReadable = fs.createReadStream('./src/files/rating.csv');
// const ratingFileReadable = fs.createReadStream('./src/files/rating.csv', { highWaterMark: 8 * 16 * 1024 });
const createFinalFileWritable = fs.createWriteStream('./src/files/animeNames.csv');

const countVotesTransform = (ratingCountConfigs) => new Transform({
  objectMode: true,
  transform(data, _encoding, callback) {
    if (!ratingCountConfigs[data.anime_id]) ratingCountConfigs[data.anime_id] = 1
    else ratingCountConfigs[data.anime_id] += 1;
    callback();
  }
});

const createFinalFileLineTransform = (ratingCountConfigs) => new Transform({
  objectMode: true,
  // highWaterMark: 16, // processes up to 16 objects at time
  transform(data, _encoding, callback) {
    const ratingCount = ratingCountConfigs[data.anime_id] ?? 0;
    const line = `${data.anime_id},${data.name},${data.anime_id === 'anime_id' ? 'votes_quantity' : ratingCount}\n`;
    callback(null, line);
  }
});

const executePipelines = async () => {
  try {
    // First pipeline
    // read file and count votes
    const ratingCountConfigs = {};
    await pipeline(
      ratingFileReadable,
      csvParser({ headers: ['user_id', 'anime_id', 'rating'] }),
      countVotesTransform(ratingCountConfigs)
    );
    console.log('Finished count\'s votes!');

    // Second pipeline
    // use ratingCountConfigs to create final file
    await pipeline(
      animeFileReadable,
      csvParser({ headers: ['anime_id', 'name', 'genre', 'type', 'episodes', 'rating', 'members'] }),
      createFinalFileLineTransform(ratingCountConfigs),
      createFinalFileWritable
    );
    console.log('Finished file\'s writing!');
  } catch (err) {
    console.error('Erro na pipeline:', err);
  };
}

await executePipelines();

console.timeEnd('Execution time')
