import fs from 'fs'

const readable = fs.createReadStream('./src/files/animeflv.csv')
const writable = fs.createWriteStream('./src/files/animeNames.csv')

// "data event" is emitted by every chunk processing
readable.on('data', (chunk) => {
  const fullBuffer = writable.write(chunk);
  // console.log(fullBuffer) // por que isso sempre é false?
  if (!fullBuffer) readable.pause();
});

// "drain event" is emitted when the buffer frees up space
writable.on('drain', () => {
  readable.resume();
});
