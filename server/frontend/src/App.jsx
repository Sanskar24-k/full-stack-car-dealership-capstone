import Register from "./components/Register/Register.jsx";

export default function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Roadway Auto Group home">
          <span className="brand-mark" aria-hidden="true">R</span>
          <span>ROADWAY <small>AUTO GROUP</small></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="/About.html">About</a>
          <a href="/Contact.html">Contact</a>
          <a className="nav-cta" href="#register">Create account</a>
        </nav>
      </header>
      <main className="register-layout">
        <section className="welcome-panel">
          <p className="eyebrow">A better way to find your next car</p>
          <h1>Good drives<br /><span>start here.</span></h1>
          <p className="welcome-copy">Save favorites, keep track of the cars you love, and get helpful updates from a team that puts people first.</p>
          <div className="welcome-photo" role="img" aria-label="A blue sedan parked on a scenic road" />
          <div className="welcome-note"><span className="note-star">✦</span><span>Local people. Straightforward advice.<br /><strong>Roadway Auto Group, Topeka</strong></span></div>
        </section>
        <section className="form-panel" id="register">
          <div className="form-heading">
            <p className="eyebrow">Join Roadway</p>
            <h2>Create your account</h2>
            <p>It takes a minute. Your next great drive is worth it.</p>
          </div>
          <Register />
          <p className="privacy-note">By registering, you agree to receive account-related updates. We keep your information private.</p>
        </section>
      </main>
      <footer className="site-footer"><span>© {new Date().getFullYear()} Roadway Auto Group</span><a href="mailto:hello@roadwaymotors.example">Questions? Get in touch</a></footer>
    </div>
  );
}
