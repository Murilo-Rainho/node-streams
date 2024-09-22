import fs from 'fs'
import { pipeline } from 'stream';

const readable = fs.createReadStream('./src/files/animeflv.csv')
const writable = fs.createWriteStream('./src/files/animeNames.csv')

pipeline(
  readable,
  writable,
  (err) => {
    if (err) {
      console.error('Erro no pipeline:', err);
    } else {
      console.log('Cópia completa com sucesso!');
    }
  }
);
