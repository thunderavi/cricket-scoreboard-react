import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ImageSlider from '../components/ImageSlider';
import '../assets/css/styles.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    { title: 'Real-time updates', desc: 'Enter runs & overs live.' },
    { title: 'Milestone alerts', desc: 'Automatic 50 / 100 highlights.' },
    { title: 'Win Predictor', desc: 'Simple algorithmic estimate.' },
  ];

  useEffect(() => {
    // Page title
    document.title = 'Live Cricket Scoreboard – Landing';
  }, []);

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero container-fluid">
        <div className="row w-100 gx-4">
          {/* LEFT: Image Slider */}
          <div className="col-lg-7 left">
            <ImageSlider />
          </div>

          {/* RIGHT: Content */}
          <div className="col-lg-5 right d-flex flex-column justify-content-center">
            <div style={{ maxWidth: '520px' }}>
              {/* Welcome Message for Logged In Users */}
              {isAuthenticated && user && (
                <div className="welcome-message mb-3">
                  Welcome back, {user.name}!
                </div>
              )}

              {/* Title */}
              <div className="h-title">Live Cricket Match Scoreboard</div>

              {/* Subtitle */}
              <div className="h-sub">
                Futuristic, real-time scoreboard system – update runs, wickets
                & overs dynamically, highlight milestones, and get a simple
                win-probability estimate. Designed for scorers, coaches, and
                fans.
              </div>

              {/* Feature List */}
              <div className="feature-list">
                {features.map((feature, index) => (
                  <div className="feature" key={index}>
                    <div className="dot"></div>
                    <div>
                      <strong>{feature.title}</strong>
                      <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
                        {feature.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="cta-row">
                {isAuthenticated ? (
                  <>
                    <Link className="btn btn-primary-acc" to="/dashboard">
                      Go to Dashboard
                    </Link>
                    <Link className="btn btn-ghost" to="/teams">
                      View Teams
                    </Link>
                  </>
                ) : (
                  <>
                    <Link className="btn btn-primary-acc" to="/signup">
                      Sign Up Now
                    </Link>
                    <a className="btn btn-ghost" href="#demo">
                      Learn More
                    </a>
                  </>
                )}
              </div>

              {/* Demo Card */}
              <div className="demo-card">
                <small style={{ color: 'var(--muted)' }}>Quick demo:</small>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '8px',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      background: '#071019',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontWeight: '700',
                    }}
                  >
                    Score <span style={{ color: 'var(--accent)' }}>0/0</span>
                  </div>
                  <div
                    style={{
                      background: '#071019',
                      padding: '10px 12px',
                      borderRadius: '8px',
                    }}
                  >
                    Overs <span style={{ color: 'var(--accent)' }}>0.0</span>
                  </div>
                  <div
                    style={{
                      background: '#071019',
                      padding: '10px 12px',
                      borderRadius: '8px',
                    }}
                  >
                    Batsman <span style={{ color: 'var(--accent)' }}>0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section id="demo" className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div
              className="card"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.01), transparent)',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.03)',
              }}
            >
              <h5 style={{ color: 'var(--accent)' }}>
                Live Scoreboard Demo
              </h5>
              <p style={{ color: 'var(--muted)' }}>
                This is a compact demo.{' '}
                {isAuthenticated ? (
                  <>
                    Start a new match from the Teams page or view your
                    Dashboard.
                  </>
                ) : (
                  <>
                    Sign up to create teams and start tracking live matches!
                  </>
                )}
              </p>
              <div className="d-flex gap-2 flex-wrap">
                {isAuthenticated ? (
                  <>
                    <Link to="/teams" className="btn btn-sm btn-primary-acc">
                      Go to Teams
                    </Link>
                    <Link to="/dashboard" className="btn btn-sm btn-ghost">
                      View Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/signup" className="btn btn-sm btn-primary-acc">
                      Sign Up Now
                    </Link>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    >
                      Back to Top
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;