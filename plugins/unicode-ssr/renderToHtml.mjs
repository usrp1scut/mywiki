import {renderToReadableStream} from 'react-dom/server.browser';
import {text} from 'node:stream/consumers';

// Keep React's streaming/Suspense support while avoiding the Node stream bug.
export async function renderToHtml(app) {
  let renderError;
  const stream = await renderToReadableStream(app, {
    onError(error) {
      renderError = error;
    },
  });
  await stream.allReady;
  if (renderError) throw renderError;
  return text(stream);
}
