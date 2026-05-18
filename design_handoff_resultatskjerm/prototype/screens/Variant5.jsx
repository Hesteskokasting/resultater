// Variant 5 — Head-to-head versus layout. Direct comparison with lead.
function Variant5({ dark }) {
  const bg = dark ? '#000' : '#fff';
  const fg = dark ? '#fff' : '#000';
  const muted = dark ? '#8a8a8a' : '#6e6e6e';
  const winBg = dark ? '#fff' : '#0a0a0a';
  const winFg = dark ? '#000' : '#fff';
  const accent = dark ? '#ffe14a' : '#d4351c';

  const Half = ({ name, score, hits, total, isLeader, align = 'left' }) => (
    <div style={{
      flex: 1,
      background: isLeader ? winBg : bg,
      color: isLeader ? winFg : fg,
      padding: '16px 22px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: align === 'left' ? 'flex-start' : 'flex-end',
      textAlign: align,
      gap: 0,
    }}>
      <div style={{ width: '100%' }}>
        <div style={{
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.2em',
          opacity: 0.7,
          marginBottom: 2,
        }}>{isLeader ? 'LEDER' : 'BAK'}</div>
        <div style={{
          fontSize: 36,
          fontWeight: 900,
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
        }}>{name}</div>
      </div>
      <div style={{
        fontSize: 208,
        fontWeight: 900,
        lineHeight: 0.82,
        letterSpacing: '-0.08em',
        fontVariantNumeric: 'tabular-nums',
        alignSelf: align === 'left' ? 'flex-start' : 'flex-end',
        marginTop: 'auto',
        marginBottom: 6,
      }}>{score}</div>
      <div style={{
        display: 'flex',
        gap: 14,
        fontSize: 13,
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
        opacity: 0.85,
      }}>
        <span>Ring: {hits}/{total}</span>
        <span>·</span>
        <span>{Math.round(hits/total*100)}%</span>
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
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `2px solid ${fg}`,
      }}>
        <button style={{
          background: 'none', border: 'none', color: fg,
          fontSize: 24, fontWeight: 800, padding: 0,
        }}>←</button>
        <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.06em' }}>Runde 1 · Bane 3</div>
        <div style={{ width: 24 }} />
      </div>
      <div style={{
        padding: '10px 16px',
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: '0.2em',
        background: fg,
        color: bg,
      }}>ØSTLANDSMESTERSKAP — FULLFØRT</div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Half name="Petter Lyngroth" score={23} hits={7} total={16} isLeader />
        <div style={{ height: 2, background: fg }} />
        <Half name="Sondre Torgersen" score={12} hits={4} total={16} align="right" />
        {/* center VS pill */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: accent,
          color: dark ? '#000' : '#fff',
          width: 64, height: 64,
          borderRadius: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          border: `3px solid ${bg}`,
        }}>
          <div style={{ fontSize: 10, letterSpacing: '0.1em' }}>LEAD</div>
          <div style={{ fontSize: 22, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>+11</div>
        </div>
      </div>
    </div>
  );
}
