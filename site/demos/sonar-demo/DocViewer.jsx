/* ORCA Sonar demo — document viewer
   Renders the document as a paper page, runs the scan animation, and
   highlights the passages Sonar extracted. Highlights reveal in document
   order as the sweep travels down; hovering a field lights its passage. */

const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function findMatch(text, quote) {
  if (!quote || !text) return null;
  const tokens = quote.trim().split(/\s+/).map(escapeRegExp).filter(Boolean);
  if (!tokens.length) return null;
  try {
    const re = new RegExp(tokens.join('\\s+'), 'i');
    const m = re.exec(text);
    return m ? { start: m.index, end: m.index + m[0].length } : null;
  } catch (e) { return null; }
}

/* Render a string, wrapping any revealed matches in <mark>. */
function MarkedText({ text, matches, revealedIds, activeId, scanStyle, markRefs }) {
  if (!matches || !matches.length) return text;
  const sorted = [...matches].sort((a, b) => a.start - b.start);
  const out = [];
  let cur = 0;
  sorted.forEach((m, i) => {
    if (m.start < cur) return;            // skip overlaps
    if (m.start > cur) out.push(text.slice(cur, m.start));
    const revealed = revealedIds.has(m.id);
    const active = activeId === m.id;
    const seg = text.slice(m.start, m.end);
    if (!revealed) { out.push(seg); cur = m.end; return; }

    const tag = scanStyle === 'inline-tag';
    const style = tag
      ? { background: active ? 'rgba(0,192,233,.22)' : 'transparent',
          borderBottom: '2px solid var(--accent-cyan)', borderRadius: 2,
          padding: '0 1px', color: 'inherit', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }
      : { background: active ? 'rgba(0,192,233,.34)' : 'rgba(0,192,233,.16)',
          borderRadius: 3, padding: '1px 3px', margin: '0 -1px', color: 'inherit',
          boxShadow: active ? '0 0 0 1.5px rgba(0,192,233,.55)' : 'none',
          boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' };
    out.push(
      <mark key={'m' + i} ref={el => { if (markRefs) markRefs.current[m.id] = el; }}
        style={{ ...style, transition: 'background .18s var(--ease-serene), box-shadow .18s',
          animation: 'markIn .32s var(--ease-serene)' }}>{seg}</mark>
    );
    cur = m.end;
  });
  if (cur < text.length) out.push(text.slice(cur));
  return out;
}

function DocViewer({ doc, fields, revealedIds, activeId, scanState, scanP, scanStyle, onScrollRef }) {
  const scrollRef = React.useRef(null);
  const pageRef = React.useRef(null);
  const markRefs = React.useRef({});

  /* Assign each field's quote to the first block (and cell) that contains it. */
  const matchMap = React.useMemo(() => {
    const map = {};            // blockIdx -> [{id,start,end}]   |  blockIdx -> {'r,c':[...]}
    const used = new Set();
    (fields || []).forEach(f => {
      if (used.has(f.id)) return;
      for (let bi = 0; bi < doc.blocks.length; bi++) {
        const b = doc.blocks[bi];
        if (b.type === 'table') {
          let hit = null;
          const scan = (arr, rTag) => arr.forEach((cell, ci) => {
            if (hit) return;
            const mm = findMatch(String(cell), f.quote);
            if (mm) hit = { key: rTag + ',' + ci, m: { id: f.id, ...mm } };
          });
          scan(b.columns, 'h');
          b.rows.forEach((r, ri) => scan(r, ri));
          if (b.foot) scan(b.foot, 'f');
          if (hit) {
            map[bi] = map[bi] || {};
            (map[bi][hit.key] = map[bi][hit.key] || []).push(hit.m);
            used.add(f.id); break;
          }
        } else {
          const mm = findMatch(b.text, f.quote);
          if (mm) {
            (map[bi] = map[bi] || []).push({ id: f.id, ...mm });
            used.add(f.id); break;
          }
        }
      }
    });
    return map;
  }, [doc, fields]);

  React.useEffect(() => { if (onScrollRef) onScrollRef(scrollRef.current); }, []);

  /* Scroll the active passage into view (no scrollIntoView). */
  React.useEffect(() => {
    if (!activeId) return;
    const el = markRefs.current[activeId];
    const sc = scrollRef.current;
    if (!el || !sc) return;
    const top = el.offsetTop - sc.clientHeight / 2 + el.offsetHeight / 2;
    sc.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, [activeId]);

  const scanning = scanState === 'scanning';
  const cellMarks = (blk, key) => (matchMap[blk] && matchMap[blk][key]) || null;

  return (
    <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative',
      background: '#eef1f5', backgroundImage: 'radial-gradient(circle, #dde4ec 1px, transparent 1px)',
      backgroundSize: '22px 22px', padding: '30px 34px 60px' }}>

      <div ref={pageRef} style={{ position: 'relative', maxWidth: 700, margin: '0 auto',
        background: '#fff', border: '1px solid var(--app-line)', borderRadius: 14,
        boxShadow: '0 1px 2px rgba(38,51,63,.06), 0 18px 50px rgba(38,51,63,.12)',
        padding: '52px 60px 60px', overflow: 'hidden' }}>

        {/* scanned veil + sweep line */}
        {scanning && scanStyle !== 'ping' && (
          <React.Fragment>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: (scanP * 100) + '%',
              background: 'linear-gradient(180deg, rgba(0,192,233,.04), rgba(0,192,233,.10))',
              pointerEvents: 'none', zIndex: 1 }} />
            {scanning && (
              <div style={{ position: 'absolute', left: -4, right: -4, top: (scanP * 100) + '%', height: 2, zIndex: 2,
                background: 'var(--accent-cyan)', boxShadow: '0 0 22px 5px rgba(0,192,233,.5)', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', right: 8, top: -22, display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--app-ink)', color: '#fff', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em',
                  padding: '4px 9px', borderRadius: 7, whiteSpace: 'nowrap' }}>
                  <Icon name="radar" size={12} color="var(--accent-cyan)" stroke={2.4} />SONAR
                </div>
              </div>
            )}
          </React.Fragment>
        )}

        {/* ping rings */}
        {scanning && scanStyle === 'ping' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%',
                border: '2px solid rgba(0,192,233,.5)', animation: `sonarPing 2.4s var(--ease-serene) ${i * 0.8}s infinite` }} />
            ))}
          </div>
        )}

        {/* document body */}
        <div style={{ position: 'relative', zIndex: 3 }}>
          {doc.blocks.map((b, bi) => {
            if (b.type === 'title') return (
              <h1 key={bi} style={{ fontFamily: 'var(--font-display)', fontSize: 23, fontWeight: 800,
                letterSpacing: '.04em', color: 'var(--app-ink)', textAlign: 'center', margin: '0 0 4px' }}>{b.text}</h1>
            );
            if (b.type === 'note') return (
              <p key={bi} style={{ textAlign: 'center', fontSize: 12, color: 'var(--app-ink-3)', fontWeight: 500,
                margin: '0 0 26px', letterSpacing: '.02em' }}>{b.text}</p>
            );
            if (b.type === 'h') return (
              <h2 key={bi} style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--app-ink)',
                margin: '24px 0 8px', letterSpacing: '.01em' }}>{b.text}</h2>
            );
            if (b.type === 'table') return (
              <table key={bi} style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0 4px',
                fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>
                <thead>
                  <tr>{b.columns.map((c, ci) => (
                    <th key={ci} style={{ textAlign: ci === 0 ? 'left' : 'right', padding: '9px 10px',
                      borderBottom: '2px solid var(--app-line-strong)', color: 'var(--app-ink)', fontWeight: 700,
                      fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      <MarkedText text={c} matches={cellMarks(bi, 'h,' + ci)} revealedIds={revealedIds}
                        activeId={activeId} scanStyle={scanStyle} markRefs={markRefs} />
                    </th>))}</tr>
                </thead>
                <tbody>
                  {b.rows.map((r, ri) => (
                    <tr key={ri}>{r.map((cell, ci) => (
                      <td key={ci} style={{ textAlign: ci === 0 ? 'left' : 'right', padding: '9px 10px',
                        borderBottom: '1px solid var(--app-line)',
                        color: ci === 0 ? 'var(--app-ink)' : 'var(--app-ink-2)', fontWeight: ci === 0 ? 600 : 500 }}>
                        <MarkedText text={cell} matches={cellMarks(bi, ri + ',' + ci)} revealedIds={revealedIds}
                          activeId={activeId} scanStyle={scanStyle} markRefs={markRefs} />
                      </td>))}</tr>
                  ))}
                  {b.foot && (
                    <tr>{b.foot.map((cell, ci) => (
                      <td key={ci} style={{ textAlign: ci === 0 ? 'left' : 'right', padding: '11px 10px',
                        borderTop: '2px solid var(--app-line-strong)', color: 'var(--app-ink)', fontWeight: 700 }}>
                        <MarkedText text={cell} matches={cellMarks(bi, 'f,' + ci)} revealedIds={revealedIds}
                          activeId={activeId} scanStyle={scanStyle} markRefs={markRefs} />
                      </td>))}</tr>
                  )}
                </tbody>
              </table>
            );
            // paragraph
            return (
              <p key={bi} style={{ fontSize: 13, lineHeight: 1.78, color: 'var(--app-ink-2)', margin: '0 0 12px' }}>
                <MarkedText text={b.text} matches={matchMap[bi]} revealedIds={revealedIds}
                  activeId={activeId} scanStyle={scanStyle} markRefs={markRefs} />
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
window.DocViewer = DocViewer;
