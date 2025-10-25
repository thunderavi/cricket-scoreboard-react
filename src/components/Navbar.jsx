import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  // Check if current path matches
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Toggle menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when clicking a link
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand brand" to="/" onClick={handleLinkClick}>
          🏏 ScoreBoard
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-controls="navLinks"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navLinks">
          <ul className="navbar-nav ms-auto align-items-center me-3">
            {/* Home - Always visible */}
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/" onClick={handleLinkClick}>
                Home
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                {/* Logged in navigation */}
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/teams')}`} to="/teams" onClick={handleLinkClick}>
                    Teams
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/match')}`} to="/match" onClick={handleLinkClick}>
                    Match
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard" onClick={handleLinkClick}>
                    Dashboard
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* Logged out navigation */}
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/signup')}`} to="/signup" onClick={handleLinkClick}>
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* CTA Button */}
          <div className="d-flex">
            {isAuthenticated ? (
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleLogout}
                style={{ minWidth: '110px' }}
              >
                Logout
              </button>
            ) : (
              <Link
                className="btn btn-sm btn-primary-acc"
                to="/signup"
                onClick={handleLinkClick}
                style={{ minWidth: '110px' }}
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background: rgba(10, 14, 20, 0.75);
          backdrop-filter: blur(6px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .nav-link {
          color: #dfe7ef !important;
          margin-right: 8px;
          transition: color 0.3s ease, transform 0.3s ease;
          position: relative;
        }

        .nav-link:hover {
          color: var(--accent) !important;
          transform: translateY(-2px);
        }

        .nav-link.active {
          color: var(--accent) !important;
          font-weight: 600;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 2px;
          background: var(--accent);
        }

        .brand {
          color: var(--accent);
          font-weight: 700;
          letter-spacing: 0.3px;
          transition: transform 0.3s ease;
        }

        .brand:hover {
          transform: scale(1.05);
        }

        .navbar-toggler {
          border-color: rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.75rem;
          cursor: pointer;
        }

        .navbar-toggler:focus {
          box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.1);
        }

        .navbar-toggler-icon {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 0.75)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
          width: 1.5em;
          height: 1.5em;
        }

        .navbar-collapse {
          transition: height 0.35s ease;
        }

        @media (max-width: 991px) {
          .navbar-nav {
            margin-top: 1rem;
          }

          .nav-link {
            padding: 0.5rem 0;
          }

          .nav-link.active::after {
            left: 0;
            transform: translateX(0);
          }

          .d-flex {
            margin-top: 1rem;
            margin-bottom: 1rem;
          }

          .d-flex .btn {
            width: 100%;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;