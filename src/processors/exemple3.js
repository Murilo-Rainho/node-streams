import fs from 'fs';
import { Transform, pipeline } from 'stream';

const readable = fs.createReadStream('./src/files/anime.csv');
const writable = fs.createWriteStream('./src/files/animeNames.csv');

let partialLine = '';
let count = 0

const transformStream = new Transform({
  transform(chunk, _encoding, callback) {
    try {
      // console.log(`encoding: ${_encoding}`);
      // console.log(chunk);
      count += 1
      // if (count === 5) throw new Error('It\'s broken!')
      const { lines, partialLine: pt } = getLines(chunk, partialLine);
      partialLine = pt;
      let names = '';
      lines.forEach((line) => {
        names = `${names}${line.split(',')[1]}\n`;
      });
      callback(null, names);
    } catch (error) {
      callback(error);
    };
  }
});

const getLines = (csvBuffer, partialLine) => {
  let csvData = csvBuffer.toString();
  const [firstLine, ...lines] = csvData.split('\r\n');
  const formattedFirstLine = `${partialLine}${firstLine}`;
  partialLine = lines.pop();
  return {
    lines: [formattedFirstLine, ...lines],
    partialLine
  };
};

pipeline(
  readable,
  transformStream,
  writable,
  (err) => {
    if (err) {
      console.error('Pipeline Error:', err);
    } else {
      console.log('Finished file\'s copy!');
    };
  }
);
console.log('Finished script');
