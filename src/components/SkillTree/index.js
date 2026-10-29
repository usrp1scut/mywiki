import React, {useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import useGlobalData from '@docusaurus/useGlobalData';
import clsx from 'clsx';
import styles from './styles.module.css';

function BranchIcon({type}) {
  const paths = {
    terminal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3m6 0h4" /></>,
    network: <><circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><path d="M12 7v5M5 17v-5h14v5" /></>,
    cluster: <><path d="m12 2 8 4.5v10L12 21l-8-4.5v-10L12 2Zm0 9 8-4.5M12 11 4 6.5M12 11v10" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" /></>,
    workflow: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /><path d="M9 6h5a4 4 0 0 1 4 4v5M6 9v9h9m-3-3 3 3-3 3" /></>,
    pulse: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
  };
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

export default function SkillTree() {
  const data = useGlobalData()['skill-tree']?.default;
  const [selectedId, setSelectedId] = useState('kubernetes');
  const [showAll, setShowAll] = useState(false);
  const detailRef = useRef(null);
  const branches = data?.branches ?? [];
  const branch = branches.find((item) => item.skills.some((skill) => skill.id === selectedId)) ?? branches[0];
  const selected = branch?.skills.find((skill) => skill.id === selectedId) ?? branch?.skills[0];

  const selectSkill = (id) => {
    setSelectedId(id);
    setShowAll(false);
  };

  if (!selected || !data.noteCount) return null;

  const notes = showAll ? selected.notes : selected.notes.slice(0, 4);
  return (
    <section id="skill-tree" className={styles.section} aria-labelledby="skill-tree-title">
      <header className={styles.heading}>
        <div>
          <h2 id="skill-tree-title">我的技能树</h2>
          <p>每一篇笔记，都是点亮技能的足迹。</p>
        </div>
        <p className={styles.totals}>{branches.length} 条分支<span aria-hidden="true"> / </span>{data.skillCount} 个技能<span aria-hidden="true"> / </span>{data.noteCount} 篇笔记</p>
      </header>

      <div className={styles.tree}>
        <div className={styles.rootRow}>
          <div className={styles.root}>
            <span className={styles.rootMark} aria-hidden="true"><svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m16 2 14 14-14 14L2 16 16 2Zm0 7 7 7-7 7-7-7 7-7Z" /><path d="M16 2v7m14 7h-7m-7 7v7M2 16h7" /></svg></span>
            <div><strong>Jacob</strong><span>运维 · DevOps</span></div>
          </div>
          <Link className={styles.certifications} to="/docs/#who-am-i" aria-label="查看 CKA、CKS、RHCE 认证记录">
            <svg width="17" height="20" viewBox="0 0 20 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="m10 2 7 3v6c0 4-7 8-7 8s-7-4-7-8V5l7-3Z" /><path d="m6 10 3 3 5-6" /></svg>
            CKA · CKS · RHCE
          </Link>
        </div>

        <nav className={styles.branchPicker} aria-label="选择技能分支">
          {branches.map((item) => <button key={item.id} type="button" aria-pressed={item.id === branch.id} onClick={() => selectSkill(item.skills[0].id)}>{item.title}</button>)}
        </nav>

        <div className={styles.branches}>
          {branches.map((item) => (
            <section key={item.id} className={clsx(styles.branch, item.id === branch.id && styles.activeBranch)} aria-labelledby={`branch-${item.id}`}>
              <h3 id={`branch-${item.id}`} className={styles.branchHeading}><span className={styles.branchIcon}><BranchIcon type={item.icon} /></span>{item.title}</h3>
              <ul className={styles.nodes}>
                {item.skills.map((skill) => (
                  <li key={skill.id} className={styles.nodeItem}>
                    <button type="button" className={clsx(styles.node, selected.id === skill.id && styles.selectedNode)}
                      aria-pressed={selected.id === skill.id} aria-controls="skill-detail"
                      aria-label={`${skill.title}，${skill.notes.length} 篇笔记`}
                      onClick={() => selectSkill(skill.id)}>
                      <span className={clsx(styles.nodeDot, skill.notes.length > 0 && styles.litDot)} aria-hidden="true" />
                      <span className={styles.nodeCopy}><strong>{skill.title}</strong><span>{skill.hint}</span></span>
                      <span className={styles.noteCount}>{skill.notes.length || '—'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className={styles.treeFooter}>
          <span><span className={clsx(styles.nodeDot, styles.litDot)} aria-hidden="true" />有笔记的技能已点亮，数字为笔记篇数</span>
          <a href="#skill-detail" onClick={(event) => {event.preventDefault(); detailRef.current?.focus(); detailRef.current?.scrollIntoView({behavior: 'instant', block: 'nearest'});}}>查看「{selected.title}」笔记 <span aria-hidden="true">↓</span></a>
        </div>
      </div>

      <div id="skill-detail" className={styles.detail} ref={detailRef} tabIndex={-1} aria-labelledby="selected-skill-title">
        <div className={styles.detailIntro}>
          <h3 id="selected-skill-title">{selected.title}</h3>
          <div className={styles.selectionStatus} role="status">{branch.title} · 已选择 {selected.title}</div>
          <p>{selected.summary}</p>
          <span className={styles.detailCount}>{selected.notes.length} 篇学习与实践笔记</span>
        </div>
        <div className={styles.noteList}>
          {notes.length ? <ul>{notes.map((note) => <li key={note.permalink}><Link to={note.permalink}><span>{note.title}</span><span aria-hidden="true">↗</span></Link></li>)}</ul> : <p className={styles.empty}>这项技能的笔记还在整理中。<Link to="/docs">先逛逛知识库 →</Link></p>}
          {selected.notes.length > 4 && <button type="button" className={styles.showMore} aria-expanded={showAll} onClick={() => setShowAll(!showAll)}>{showAll ? '收起笔记' : `展开全部 ${selected.notes.length} 篇笔记`}<span aria-hidden="true">{showAll ? '−' : '+'}</span></button>}
        </div>
      </div>
    </section>
  );
}
