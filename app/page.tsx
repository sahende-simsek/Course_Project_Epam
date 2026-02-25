export default function Home() {
  return (
    <main className="home-page">
      <section className="hero hero--primary card">
        <div className="hero-content">
          <h1>InnovatEPAM Portal</h1>
          <p>
            A simple internal innovation platform where EPAM teams can submit ideas,
            collaborate with evaluators and track the full intrapreneurship journey.
          </p>
          <div className="cta">
            <a className="btn" href="/register">Create innovator account</a>
            <a className="btn secondary" href="/login" style={{ marginLeft: 12 }}>
              Sign in to InnovatEPAM
            </a>
          </div>
        </div>
      </section>

      <section className="grid home-sections">
        <article className="card home-section">
          <h3>For innovators</h3>
          <p className="muted">
            Capture ideas in minutes, attach supporting documents and track status
            as your initiative moves from submitted to under review, accepted or
            rejected.
          </p>
        </article>
        <article className="card home-section">
          <h3>For evaluators</h3>
          <p className="muted">
            Review a curated queue of proposals, leave structured feedback and
            take clear Accept / Reject decisions with full status history.
          </p>
        </article>
        <article className="card home-section">
          <h3>Built for EPAM</h3>
          <p className="muted">
            Opinionated, secure flows that fit internal innovation programs,
            while remaining simple enough to extend and integrate with existing
            tools.
          </p>
        </article>
      </section>
    </main>
  );
}
