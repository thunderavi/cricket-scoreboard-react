import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../assets/css/sign.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();

  const [formType, setFormType] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
    setMessage({ type: '', text: '' });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Name validation (only for signup)
    if (formType === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name cannot be empty';
      }
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@gmail\.com$/.test(formData.email)) {
      newErrors.email = 'Enter a valid Gmail address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formType === 'signup') {
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) {
        newErrors.password = 'Password must be 8+ chars with letters & numbers';
      }
    } else {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let result;

      if (formType === 'signup') {
        result = await signup(formData.name, formData.email, formData.password);
      } else {
        result = await login(formData.email, formData.password);
      }

      if (result.success) {
        setMessage({
          type: 'success',
          text: formType === 'signup' ? 'Account created successfully!' : 'Login successful!',
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Something went wrong',
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and signup
  const toggleFormType = () => {
    setFormType((prev) => (prev === 'login' ? 'signup' : 'login'));
    setFormData({ name: '', email: '', password: '' });
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  return (
    <>
      <Navbar />

      <div className="form-container">
        <div className="container-box" id="form-box">
          <h2 id="form-title">{formType === 'signup' ? 'Sign Up' : 'Login'}</h2>

          {/* Success/Error Message */}
          {message.text && (
            <div
              className={`alert ${
                message.type === 'success' ? 'alert-success' : 'alert-danger'
              }`}
              role="alert"
              style={{
                fontSize: '14px',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '8px',
              }}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} id="auth-form">
            {/* Name Field (only for signup) */}
            {formType === 'signup' && (
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.name && (
                  <small style={{ color: '#f87171', fontSize: '12px' }}>
                    {errors.name}
                  </small>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && (
                <small style={{ color: '#f87171', fontSize: '12px' }}>
                  {errors.email}
                </small>
              )}
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder={
                  formType === 'signup'
                    ? 'Create a password'
                    : 'Enter your password'
                }
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.password && (
                <small style={{ color: '#f87171', fontSize: '12px' }}>
                  {errors.password}
                </small>
              )}
              {formType === 'signup' && !errors.password && (
                <small
                  style={{
                    color: '#9ca3af',
                    display: 'block',
                    marginTop: '4px',
                    fontSize: '12px',
                  }}
                >
                  Must be 8+ characters with letters & numbers
                </small>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {formType === 'signup' ? 'Signing Up...' : 'Logging In...'}
                </>
              ) : (
                <>{formType === 'signup' ? 'Sign Up' : 'Login'}</>
              )}
            </button>

            {/* Google Sign In (Placeholder) */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => alert('Google Sign-in not implemented yet')}
              disabled={loading}
            >
              Sign {formType === 'signup' ? 'up' : 'in'} with Google
            </button>
          </form>

          {/* Toggle Link */}
          <p className="switch" id="switch-text">
            {formType === 'signup' ? (
              <>
                Already have an account?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); toggleFormType(); }}>
                  Login
                </a>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); toggleFormType(); }}>
                  Sign Up
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUp;