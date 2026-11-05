import {matchRegex} from './logic.mjs';

self.onmessage = ({data}) => {
  try { self.postMessage({value: matchRegex(data.pattern, data.flags, data.text)}); }
  catch (error) { self.postMessage({error: error.message}); }
};
