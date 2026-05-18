// Variant 3 — Number-first. Score fills the card; name becomes a label below.
function Variant3({ dark }) {
  const bg = dark ? '#15161a' : '#ffffff';
  const fg = dark ? '#ffffff' : '#0a0a0a';
  const rule = dark ? '#2a2b30' : '#e4e4e4';
  const muted = dark ? '#9a9a9f' : '#6e6e6e';
  const win = dark ? '#7dd47a' : '#0e6b2b';

  const Big = ({ name, score, hits, total, isLeader, diff }) => (
    <div style={{
      flex: 1,
      padding: '16px 24px 22px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 2,
      }}>
        <div style={{
          fontSize: 38,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          lineHeight: 1.0,
        }}>{name}</div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.18em',
          color: isLeader ? win : muted,
          flexShrink: 0,
        }}>
          {isLeader && <span style={{ width: 8, height: 8, borderRadius: 999, background: win }} />}
          <span>{isLeader ? 'LEDER' : `−${diff}`}</span>
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'end',
        gap: 18,
        marginTop: 'auto',
      }}>
        <div style={{
          fontSize: 236,
          fontWeight: 900,
          lineHeight: 0.82,
          letterSpacing: '-0.08em',
          fontVariantNumeric: 'tabular-nums',
        }}>{score}</div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 12,
          paddingBottom: 14,
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: muted, fontWeight: 800, letterSpacing: '0.16em' }}>RING</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{hits}<span style={{ color: muted, fontWeight: 700 }}>/{total}</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: muted, fontWeight: 800, letterSpacing: '0.16em' }}>RATE</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{Math.round(hits/total*100)}%</div>
          </div>
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
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${rule}`,
      }}>
        <button style={{
          background: 'none', border: 'none', color: fg,
          fontSize: 24, fontWeight: 800, padding: 0,
        }}>←</button>
        <div style={{ fontSize: 14, fontWeight: 900 }}>Fullført</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: muted, fontVariantNumeric: 'tabular-nums' }}>R1 · Bane 3</div>
      </div>
      <Big name="Petter Lyngroth" score={23} hits={7} total={16} isLeader />
      <div style={{ height: 1, background: rule, margin: '0 24px' }} />
      <Big name="Sondre Torgersen" score={12} hits={4} total={16} diff={11} />
    </div>
  );
}
