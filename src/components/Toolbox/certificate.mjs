export async function parseCertificates(input, now = Date.now()) {
  if ((typeof input === 'string' ? input.length : input.byteLength) > 1024 * 1024) throw new Error('证书内容请控制在 1 MB 以内。');
  await import('reflect-metadata');
  const {X509Certificate, SubjectAlternativeNameExtension} = await import('@peculiar/x509');
  const {sha256} = await import('hash-wasm');
  let sources;
  if (typeof input === 'string') {
    if (/PRIVATE KEY/.test(input)) throw new Error('这里需要公钥证书，不是私钥文件。');
    sources = input.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g);
    if (!sources?.length) throw new Error('请输入 PEM 证书，或通过文件选择器读取 DER/CRT 证书。');
    if (sources.length > 20) throw new Error('每次最多解析 20 张证书。');
  } else sources = [input];
  try {
    return await Promise.all(sources.map(async source => {
      const cert = new X509Certificate(source);
      const san = cert.getExtension(SubjectAlternativeNameExtension)?.names.toJSON() || [];
      const fingerprint = (await sha256(new Uint8Array(cert.rawData))).toUpperCase().match(/.{2}/g).join(':');
      return {subject: cert.subject, issuer: cert.issuer, serial: cert.serialNumber, notBefore: cert.notBefore.toISOString(), notAfter: cert.notAfter.toISOString(), status: now < +cert.notBefore ? '尚未生效' : now > +cert.notAfter ? '已过期' : '处于有效期内（未验证信任链）', san: san.map(n => n.type + ': ' + n.value).join('\n') || '未包含 SAN', algorithm: cert.signatureAlgorithm.name + (cert.signatureAlgorithm.hash ? ' / ' + cert.signatureAlgorithm.hash.name : ''), fingerprint};
    }));
  } catch { throw new Error('无法解析证书，请检查 PEM/DER 格式及内容是否完整。'); }
}
