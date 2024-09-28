import fs from 'fs'

const readable = fs.createReadStream('./src/files/anime.csv')
const writable = fs.createWriteStream('./src/files/animeNames.csv', { highWaterMark: 8 * 16 * 1024 })

// simulate back pressure
let count = 0

// By defining a "data" event, the stream is started and this event will be emitted for each chunk processing
readable.on('data', async (chunk) => {
  console.log(chunk.toString().slice(0, 60))

  // simulate back pressure
  count += 1
  if (count === 5) await sleep(5)

  const fullBuffer = writable.write(chunk);
  console.log(chunk.toString().slice(0, 60))
  console.log(fullBuffer)
  if (!fullBuffer) readable.pause();
});

// "drain event" is emitted when the buffer frees up space
writable.on('drain', () => {
  readable.resume();
});

const sleep = ms => new Promise(res => setTimeout(res, ms));
