export default function Alert({ tipo = 'error', children }) {
  if (!children) return null
  const styles = {
    error: { bg:'var(--cp-error-bg)', color:'var(--cp-error)', border:'rgba(192,57,43,0.25)' },
    info:  { bg:'#EEF4FF', color:'#1D4ED8', border:'#CDDDFF' },
    ok:    { bg:'#ECFDF5', color:'#065F46', border:'#A7F3D0' },
  }
  const s = styles[tipo] || styles.error
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius:'var(--cp-radius)', padding:'0.75rem 1rem',
      fontSize:14, marginBottom:'1rem'
    }}>
      {children}
    </div>
  )
}
