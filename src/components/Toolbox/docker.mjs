import {checkText} from './logic.mjs';

// A deliberately literal POSIX lexer: never evaluates shell expansion or commands.
export function shellWords(source) {
  checkText(source);
  const words = [];
  let word = '', quote = '', started = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quote === "'") {
      if (c === "'") quote = ''; else word += c;
      continue;
    }
    if (c === '\\') {
      const next = source[++i];
      if (next === undefined) throw new Error('命令末尾的反斜杠不完整。');
      if (next === '\n') continue;
      if (quote === '"' && !['$', '`', '"', '\\'].includes(next)) word += '\\';
      word += next; started = true; continue;
    }
    if (c === '$' || c === '`') throw new Error('请先将 Shell 变量和命令替换展开为实际值；此工具不会执行 Shell。');
    if (quote === '"') { if (c === '"') quote = ''; else word += c; continue; }
    if (c === "'" || c === '"') { quote = c; started = true; continue; }
    if (/\s/.test(c)) { if (started) { words.push(word); word = ''; started = false; } continue; }
    if (';&|<>()'.includes(c) || (c === '#' && !started)) throw new Error('仅支持单条 docker run 命令，不支持管道、重定向或注释。');
    if ('*?[]~'.includes(c)) throw new Error('请将通配符、方括号或 ~ 路径放在引号内，或先展开为实际值。');
    word += c; started = true;
  }
  if (quote) throw new Error('引号未闭合。');
  if (started) words.push(word);
  return words;
}

export async function dockerToCompose(source) {
  const words = shellWords(source);
  if (words[0] === 'sudo') words.shift();
  if (words.shift() !== 'docker' || words.shift() !== 'run') throw new Error('命令必须以 docker run 或 sudo docker run 开头。');
  const service = {}, volumes = Object.create(null), networks = Object.create(null), notes = [];
  const lists = {'-p': 'ports', '--publish': 'ports', '-e': 'environment', '--env': 'environment', '-v': 'volumes', '--volume': 'volumes', '-l': 'labels', '--label': 'labels', '--env-file': 'env_file', '--add-host': 'extra_hosts', '--cap-add': 'cap_add', '--cap-drop': 'cap_drop', '--dns': 'dns', '--expose': 'expose'};
  const scalars = {'--name': 'container_name', '--restart': 'restart', '-w': 'working_dir', '--workdir': 'working_dir', '-u': 'user', '--user': 'user', '-h': 'hostname', '--hostname': 'hostname', '--entrypoint': 'entrypoint', '--platform': 'platform', '--memory': 'mem_limit', '-m': 'mem_limit', '--cpus': 'cpus', '--shm-size': 'shm_size', '--network': 'network_mode', '--net': 'network_mode'};
  const flags = {'-t': 'tty', '--tty': 'tty', '-i': 'stdin_open', '--interactive': 'stdin_open', '--privileged': 'privileged', '--read-only': 'read_only', '--init': 'init'};
  const literal = value => value.replaceAll('$', () => '$$');
  while (words.length && words[0].startsWith('-')) {
    let option = words.shift();
    if (option === '--') break;
    if (/^-[dit]{2,}$/.test(option)) { words.unshift(...option.slice(1).split('').map(c => '-' + c)); continue; }
    let inline;
    if (option.startsWith('--') && option.includes('=')) { const p = option.indexOf('='); inline = option.slice(p + 1); option = option.slice(0, p); }
    else if (/^-[pevlwuhm].+/.test(option)) { inline = option.slice(2); option = option.slice(0, 2); }
    if (option === '-d' || option === '--detach') { if (inline !== undefined && !['true', 'false'].includes(inline)) throw new Error('detach 应为 true 或 false。'); notes.push('后台运行请使用 docker compose up -d。'); continue; }
    if (flags[option]) {
      if (inline !== undefined && !['true', 'false'].includes(inline)) throw new Error(option + ' 应为 true 或 false。');
      service[flags[option]] = inline !== 'false'; continue;
    }
    const key = lists[option] || scalars[option];
    if (!key) throw new Error('暂不支持参数 ' + option + '，未生成可能缺少配置的结果。支持端口、环境变量、卷、名称、重启策略、网络、用户、工作目录等常用参数。');
    const value = inline ?? words.shift();
    if (value === undefined || value === '') throw new Error(option + ' 缺少参数值。');
    if (lists[option]) (service[key] ||= []).push(literal(value));
    else if (key === 'cpus') { if (!/^\d+(\.\d+)?$/.test(value) || !Number.isFinite(+value) || +value <= 0) throw new Error('CPU 数量应为正数。'); service[key] = +value; }
    else service[key] = literal(value);
  }
  const image = words.shift();
  if (!image || /\s/.test(image)) throw new Error('缺少有效的镜像名称。');
  service.image = literal(image);
  if (words.length) service.command = words.map(literal);
  for (const volume of service.volumes || []) {
    const parts = volume.split(':');
    if (parts.length > 1 && /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(parts[0])) volumes[parts[0]] = {external: true};
    else if (parts.length > 1 && !/^(?:\/|\.\.?\/)/.test(parts[0])) throw new Error('卷源不是有效的命名卷或 POSIX 路径：' + parts[0]);
  }
  if (Object.keys(volumes).length) notes.push('命名卷标为 external，复用 docker run 使用的既有卷。');
  const net = service.network_mode;
  if (net && !['host', 'none', 'bridge'].includes(net) && !net.startsWith('container:')) {
    networks[net] = {external: true}; service.networks = [net]; delete service.network_mode;
  }
  const name = (service.container_name || 'app').replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^[^a-zA-Z0-9]+/, '') || 'app';
  const compose = {services: {[name]: {image: service.image, ...service}}};
  if (Object.keys(volumes).length) compose.volumes = volumes;
  if (Object.keys(networks).length) compose.networks = networks;
  const {stringify} = await import('yaml');
  return {yaml: stringify(compose, {lineWidth: 0}), notes: [...new Set(notes)]};
}
