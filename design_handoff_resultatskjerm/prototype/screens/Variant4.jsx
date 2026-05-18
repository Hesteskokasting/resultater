// Variant 4 — Status stripe. Vertical accent bar = leader. Clean & minimal.
function Variant4({ dark }) {
  const bg = dark ? '#0f1115' : '#fafaf7';
  const card = dark ? '#1a1d24' : '#ffffff';
  const fg = dark ? '#f5f5f0' : '#111111';
  const muted = dark ? '#8a8e96' : '#787870';
  const rule = dark ? '#2a2d35' : '#e8e8e2';
  const leadStripe = dark ? '#ffd84a' : '#0a4d2a';
  const trailStripe = dark ? '#3a3d45' : '#cfcfc8';

  const Card = ({ name, score, hits, total, isLeader, rank }) => (
    <div style={{
      background: card,
      borderRadius: 18,
      overflow: 'hidden',
      display: 'flex',
      boxShadow: dark ? 'none' : '0 1px 0 rgba(0,0,0,0.04)',
      border: `1px solid ${rule}`,
    }}>
      <div style={{ width: 8, background: isLeader ? leadStripe : trailStripe, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '16px 22px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.18em',
            padding: '5px 9px',
            borderRadius: 6,
            background: isLeader ? leadStripe : 'transparent',
            color: isLeader ? (dark ? '#0f1115' : '#fff') : muted,
            border: isLeader ? 'none' : `1.5px solid ${rule}`,
            flexShrink: 0,
          }}>{isLeader ? 'LEDER' : `#${rank}`}</div>
          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.0 }}>{name}</div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 24,
          alignItems: 'end',
        }}>
          <div style={{
            fontSize: 140,
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: '-0.07em',
            fontVariantNumeric: 'tabular-nums',
          }}>{score}</div>
          <div style={{ paddingBottom: 10 }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <Stat label="Ring" value={`${hits}/${total}`} muted={muted} />
              <Stat label="Rate" value={`${Math.round(hits/total*100)}%`} muted={muted} />
            </div>
          </div>
        </div>
        {/* progress dots: 16 rings */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(16, 1fr)',
          gap: 4,
          marginTop: 14,
        }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{
              height: 8,
              borderRadius: 2,
              background: i < hits ? (isLeader ? leadStripe : fg) : rule,
            }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: bg,
      color: fg,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        padding: '14px 16px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button style={{
          background: card, border: `1px solid ${rule}`, color: fg,
          width: 38, height: 38, borderRadius: 12, fontSize: 18, fontWeight: 800,
        }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.01em' }}>Fullført</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: '0.06em' }}>Østlandsmesterskap · R1 · Bane 3</div>
        </div>
        <div style={{ width: 38 }} />
      </div>
      <div style={{ padding: '4px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <Card name="Petter Lyngroth" score={23} hits={7} total={16} isLeader rank={1} />
        <Card name="Sondre Torgersen" score={12} hits={4} total={16} rank={2} />
      </div>
    </div>
  );
}

function Stat({ label, value, muted }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 11, color: muted, fontWeight: 800, letterSpacing: '0.16em', minWidth: 44 }}>{label.toUpperCase()}</span>
      <span style={{ fontSize: 18, fontWeight: 900 }}>{value}</span>
    </div>
  );
}
