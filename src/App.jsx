import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';

const initialForms = {
  login: {
    email: '',
    password: '',
  },
  register: {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
};

const initialErrors = {
  login: {
    email: '',
    password: '',
  },
  register: {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CartBadge() {
  return (
    <div className="cart-badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h2l1.6 7.2a1 1 0 0 0 1 .8h7.8a1 1 0 0 0 1-.8L19 7H8" />
        <circle cx="10" cy="18" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="17" cy="18" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState('login');
  const [forms, setForms] = useState(initialForms);
  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const updateField = (formType, field, value) => {
    setForms((current) => ({
      ...current,
      [formType]: {
        ...current[formType],
        [field]: value,
      },
    }));

    setErrors((current) => ({
      ...current,
      [formType]: {
        ...current[formType],
        [field]: '',
      },
    }));

    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (mode === 'login') {
      const loginErrors = {
        email: '',
        password: '',
      };

      if (!forms.login.email.trim()) {
        loginErrors.email = 'Email is required.';
      } else if (!emailPattern.test(forms.login.email)) {
        loginErrors.email = 'Enter a valid email address.';
      }

      if (!forms.login.password.trim()) {
        loginErrors.password = 'Password is required.';
      }

      setErrors((current) => ({
        ...current,
        login: loginErrors,
      }));

      if (Object.values(loginErrors).some(Boolean)) {
        return;
      }

      setLoading(true);

      try {
        const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(forms.login),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setErrorMessage(data?.message || 'Unable to sign in right now. Please try again.');
          return;
        }

        console.log('Login success:', data);
        setSuccessMessage(data?.message || 'Signed in successfully.');
      } catch (error) {
        console.error('Login request failed:', error);
        setErrorMessage('Could not connect to the server. Please try again.');
      } finally {
        setLoading(false);
      }

      return;
    }

    const registerErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!forms.register.fullName.trim()) {
      registerErrors.fullName = 'Full name is required.';
    }

    if (!forms.register.email.trim()) {
      registerErrors.email = 'Email is required.';
    } else if (!emailPattern.test(forms.register.email)) {
      registerErrors.email = 'Enter a valid email address.';
    }

    if (!forms.register.password) {
      registerErrors.password = 'Password is required.';
    } else if (forms.register.password.length < 6) {
      registerErrors.password = 'Password must be at least 6 characters.';
    }

    if (!forms.register.confirmPassword) {
      registerErrors.confirmPassword = 'Please confirm your password.';
    } else if (forms.register.confirmPassword !== forms.register.password) {
      registerErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors((current) => ({
      ...current,
      register: registerErrors,
    }));

    if (Object.values(registerErrors).some(Boolean)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: forms.register.fullName,
          email: forms.register.email,
          password: forms.register.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(data?.message || 'Unable to create your account. Please try again.');
        return;
      }

      console.log('Register success:', data);
      setSuccessMessage(data?.message || 'Account created successfully.');
    } catch (error) {
      console.error('Register request failed:', error);
      setErrorMessage('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="auth-preview">
        <div className="auth-card">
          <header className="brand-panel">
            <CartBadge />
            <h1>Smart Grocery</h1>
            <p>Manage food &amp; budget</p>
          </header>

          <div className="form-panel">
            <div className="mode-switch" role="tablist" aria-label="Authentication forms">
              <button
                type="button"
                className={mode === 'login' ? 'mode-tab active' : 'mode-tab'}
                onClick={() => switchMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'mode-tab active' : 'mode-tab'}
                onClick={() => switchMode('register')}
              >
                Register
              </button>
            </div>

            {mode === 'login' ? (
              <Login
                form={forms.login}
                errors={errors.login}
                loading={loading}
                successMessage={successMessage}
                errorMessage={errorMessage}
                onFieldChange={(field, value) => updateField('login', field, value)}
                onSwitchMode={() => switchMode('register')}
                onSubmit={handleSubmit}
              />
            ) : (
              <Register
                form={forms.register}
                errors={errors.register}
                loading={loading}
                successMessage={successMessage}
                errorMessage={errorMessage}
                onFieldChange={(field, value) => updateField('register', field, value)}
                onSwitchMode={() => switchMode('login')}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
