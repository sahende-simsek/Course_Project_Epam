export default function Footer(){
  return (
    <footer className="site-footer">
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <div style={{marginBottom:8}}>© {new Date().getFullYear()} Auth Demo</div>
        <div>Built with React + Next.js — demo styling inspired by modern enterprise sites.</div>
      </div>
    </footer>
  )
}
