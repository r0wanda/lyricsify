import { searchLyrics } from '../dist/index.js';

searchLyrics('The joker and the queen', 'ed sheeran').then(resp => {
  console.log('kael', resp);
});

searchLyrics('花妖', '刀郎').then(resp => {
  console.log('kael', resp);
});
