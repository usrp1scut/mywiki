import {hashFile} from './extended.mjs';
self.onmessage = async ({data}) => {
  try {
    const value = await hashFile(data.file, data.algorithm, progress => self.postMessage({progress}));
    self.postMessage({value});
  } catch (error) { self.postMessage({error: error.message}); }
};
