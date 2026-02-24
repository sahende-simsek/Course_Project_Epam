export default function Home() {
  return (
    <main>
      <section className="hero card">
        <div>
          <h1>Fast, secure authentication</h1>
          <p>Sign up, sign in, and explore the authentication flows — clean, tested, and ready for integration.</p>
          <div className="cta">
            <a className="btn" href="/register">Get started</a>
            <a className="btn secondary" href="/login" style={{marginLeft:12}}>Sign in</a>
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <img src="/logo192.png" alt="logo" style={{width:120,opacity:0.9}} />
        </div>
      </section>

      <div className="grid" style={{marginTop:20}}>
        <div className="card">
          <h3>Why this demo</h3>
          <p className="muted">Built to exercise API-backed auth flows with clear test coverage and a simple React frontend.</p>
        </div>
        <div className="card auth-card">
          <h3>Quick actions</h3>
          <a className="btn" href="/register">Register</a>
          <a className="btn secondary" href="/login">Login</a>
        </div>
      </div>
    </main>
  )
}
