export default function Header(){
  return (
    <header className="site-header">
      <div className="inner">
        <div className="brand">Auth Demo</div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/register">Register</a>
          <a href="/login">Login</a>
        </nav>
      </div>
    </header>
  )
}
