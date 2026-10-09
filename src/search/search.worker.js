import {search} from './engine';
self.onmessage = async ({data: {id, query, baseUrl}}) => {
  try {
    self.postMessage({id, result: await search(query, baseUrl)});
  } catch (error) {
    self.postMessage({id, error: error.message || '搜索暂时不可用'});
  }
};
