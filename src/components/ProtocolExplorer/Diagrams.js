import React, {useId} from 'react';
import styles from './styles.module.css';

// X is a percentage of the drawing area; Y is in pixels so labels stay legible on phones.
const layouts = {
  2: [[22, 72], [78, 72]],
  3: [[18, 105], [77, 51], [77, 155]],
  4: [[17, 74], [39, 74], [61, 74], [83, 74]],
  5: [[13, 126], [43, 126], [81, 41], [81, 126], [81, 211]],
};

function Arrowhead({id}) {
  return <defs><marker id={id} viewBox="0 0 10 10" refX="9" refY="5"
    markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M1 1 9 5 1 9" fill="none" stroke="currentColor" strokeWidth="1.7" />
  </marker></defs>;
}

function Device({kind}) {
  if (kind === 'client') return <g>
    <rect x="-13" y="-10" width="26" height="17" rx="2" />
    <path d="M-4 8v3h8V8m-13 5H9" />
  </g>;
  if (kind === 'router') return <g>
    <rect x="-13" y="-7" width="26" height="16" rx="3" />
    <path d="M-8 -7v-7m16 7v-7m-16 17h3m4 0h3" />
  </g>;
  return <g>
    <rect x="-12" y="-12" width="24" height="10" rx="2" />
    <rect x="-12" y="2" width="24" height="10" rx="2" />
    <path d="M-8 -7h2m-2 14h2m6-14h8m-8 14h8" />
  </g>;
}

export function Network({lesson, index}) {
  const arrow = useId();
  const positions = layouts[lesson.nodes.length];
  const height = Math.max(...positions.map(([, y]) => y)) + 83;
  const packet = lesson.steps[index];
  const [x1, y1] = positions[packet.from];
  const [x2, y2] = positions[packet.to];
  const links = new Map();
  for (const {from, to} of lesson.steps) {
    links.set([Math.min(from, to), Math.max(from, to)].join('-'), [positions[from], positions[to]]);
  }

  return <div className={styles.network} style={{height}}>
    <svg width="100%" height={height} role="img"
      aria-label={lesson.name + ' 节点图，' + lesson.nodes[packet.from].name + ' → ' + lesson.nodes[packet.to].name}>
      <Arrowhead id={arrow} />
      {Array.from(links, ([key, [[ax, ay], [bx, by]]]) =>
        <line key={key} x1={ax + '%'} y1={ay} x2={bx + '%'} y2={by} className={styles.wire} />)}
      <line x1={x1 + '%'} y1={y1} x2={x2 + '%'} y2={y2} className={styles.activeWire} />
      <line x1={x1 + '%'} y1={y1} x2={(x1 + x2) / 2 + '%'} y2={(y1 + y2) / 2}
        className={styles.activeWire} markerEnd={'url(#' + arrow + ')'} />
      {lesson.nodes.map((node, n) => <svg key={node.name} x={positions[n][0] + '%'} y={positions[n][1]} width="1" height="1" overflow="visible">
        <g className={n === packet.from || n === packet.to ? styles.activeDevice : styles.device}>
          <rect x="-22" y="-20" width="44" height="40" rx="5" className={styles.iconBox} />
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><Device kind={node.kind} /></g>
        </g>
        <text textAnchor="middle" y="39" className={styles.nodeName}>{node.name}</text>
        <text textAnchor="middle" y="56" className={styles.address}
          data-stagger={lesson.nodes.length === 4 && n % 2 === 1 || undefined}>{node.address}</text>
      </svg>)}
    </svg>
    <span key={index} aria-hidden="true" className={styles.packet} style={{
      '--from-x': x1 + '%', '--to-x': x2 + '%', '--from-y': y1 + 'px', '--to-y': y2 + 'px',
    }} />
  </div>;
}

export function Sequence({lesson, index}) {
  const arrow = useId();
  const lane = n => (n + 0.5) * 100 / lesson.nodes.length + '%';
  const row = n => 65 + 40 * n;
  const height = row(lesson.steps.length - 1) + 23;
  return <svg width="100%" height={height} role="img" aria-label={lesson.name + ' 报文时序图，自上而下为发生顺序'}>
    <Arrowhead id={arrow} />
    <rect x="0" y={row(index) - 24} width="100%" height="38" className={styles.rowHighlight} />
    {lesson.nodes.map((node, n) => <g key={node.name}>
      <text x={lane(n)} y="23" textAnchor="middle" className={styles.nodeName}>{node.name}</text>
      <line x1={lane(n)} x2={lane(n)} y1="32" y2={height - 7} className={styles.wire} strokeDasharray="3 4" />
    </g>)}
    {lesson.steps.map((packet, n) => <g key={n} className={n === index ? styles.activeMessage : styles.message}>
      <line x1={lane(packet.from)} x2={lane(packet.to)} y1={row(n)} y2={row(n)} stroke="currentColor" markerEnd={'url(#' + arrow + ')'} />
      <text x={lane((packet.from + packet.to) / 2)} y={row(n) - 6} textAnchor="middle">{n + 1} · {packet.label}</text>
    </g>)}
  </svg>;
}
