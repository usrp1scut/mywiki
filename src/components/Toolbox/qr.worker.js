import jsQR from 'jsqr';
self.onmessage = ({data}) => {
  try {
    const code = jsQR(new Uint8ClampedArray(data.pixels), data.width, data.height, {inversionAttempts: 'attemptBoth'});
    self.postMessage(code ? {value: code.data} : {error: '没有识别到二维码，请使用清晰、完整且带白色边距的图片。'});
  } catch { self.postMessage({error: '图片识别失败，请更换图片后重试。'}); }
};
