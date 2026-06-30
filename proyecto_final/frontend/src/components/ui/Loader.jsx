export default function Loader({ text = 'Cargando...' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'20px 0', color:'var(--cp-texto-sec)' }}>
      <span className="cp-spinner" />
      <span style={{ fontSize:14 }}>{text}</span>
    </div>
  )
}
