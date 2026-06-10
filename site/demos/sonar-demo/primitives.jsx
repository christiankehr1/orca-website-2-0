/* ORCA Sonar demo — shared primitives (forked from the app UI kit) */

/* Lucide icon as inline SVG, filled imperatively. */
function Icon({ name, size = 20, stroke = 1.75, color, className, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = `<i data-lucide="${name}"></i>`;
    if (window.lucide) window.lucide.createIcons();
    const svg = el.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.style.strokeWidth = stroke;
    }
  });
  return <span ref={ref} className={className}
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color, ...style }} />;
}

/* Extracted-field category → icon + human label. */
const CATEGORY = {
  date:         { icon: 'calendar',            label: 'Date' },
  entity:       { icon: 'briefcase',           label: 'Entity' },
  person:       { icon: 'user',                label: 'Person' },
  ownership:    { icon: 'pie-chart',           label: 'Ownership' },
  value:        { icon: 'circle-dollar-sign',  label: 'Value' },
  jurisdiction: { icon: 'map-pin',             label: 'Jurisdiction' },
  role:         { icon: 'scale',               label: 'Role' },
  other:        { icon: 'tag',                 label: 'Detail' },
};

function CategoryTile({ category, size = 32, dark }) {
  const c = CATEGORY[category] || CATEGORY.other;
  return (
    <div style={{ width: size, height: size, borderRadius: 9, flex: 'none',
      background: dark ? 'var(--app-slate)' : '#eef1f8',
      color: dark ? '#fff' : 'var(--app-slate-icon)',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={c.icon} size={size * 0.54} stroke={2} />
    </div>
  );
}

/* Confidence as a small pill. >=.9 cyan, >=.7 slate, else yellow-ish. */
function ConfidencePill({ value }) {
  const pct = Math.round(value * 100);
  const tone = value >= 0.9
    ? { bg: 'rgba(0,192,233,.12)', fg: '#0090b4', dot: 'var(--accent-cyan)' }
    : value >= 0.7
      ? { bg: 'var(--app-select-soft)', fg: 'var(--app-ink-2)', dot: 'var(--app-slate-icon)' }
      : { bg: 'rgba(233,66,0,.10)', fg: '#c43900', dot: 'var(--accent-red)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px 3px 7px',
      borderRadius: 999, background: tone.bg, color: tone.fg, fontSize: 11, fontWeight: 700,
      fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: tone.dot }} />
      {pct}%
    </span>
  );
}

function Button({ variant = 'app', icon, iconRight, children, onClick, disabled, style }) {
  const base = {
    fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, border: 0,
    cursor: disabled ? 'default' : 'pointer', padding: icon && !children ? '9px' : '11px 17px',
    borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8,
    letterSpacing: '.01em', transition: 'filter .14s var(--ease-serene), transform .12s, opacity .14s',
    lineHeight: 1, whiteSpace: 'nowrap', opacity: disabled ? 0.45 : 1
  };
  const variants = {
    app: { background: 'var(--app-primary)', color: '#fff', boxShadow: '0 6px 16px rgba(48,74,255,.28)' },
    cyan: { background: 'var(--accent-cyan)', color: '#072a33', boxShadow: '0 6px 16px rgba(0,192,233,.32)' },
    secondary: { background: '#fff', color: 'var(--app-ink)', boxShadow: 'inset 0 0 0 1.5px var(--app-line-strong)' },
    ghost: { background: 'transparent', color: 'var(--app-ink-2)' },
  };
  return (
    <button onClick={disabled ? undefined : onClick}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(.985)'; }}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(.96)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}>
      {icon && <Icon name={icon} size={16} stroke={2} />}{children}
      {iconRight && <Icon name={iconRight} size={16} stroke={2.2} />}
    </button>
  );
}

/* Three-dot loading shimmer. */
function Dots({ color = 'var(--app-ink-3)' }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: 999, background: color,
          animation: `dotPulse 1s var(--ease-serene) ${i * 0.16}s infinite` }} />
      ))}
    </span>
  );
}

Object.assign(window, { Icon, CATEGORY, CategoryTile, ConfidencePill, Button, Dots });
