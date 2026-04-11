function Login({
  form,
  errors,
  loading,
  successMessage,
  errorMessage,
  onFieldChange,
  onSwitchMode,
  onSubmit,
}) {
  return (
    <>
      <div className="form-copy">
        <h2>Welcome back</h2>
        <p>Sign in to track groceries, spending, and meal planning.</p>
      </div>

      <form onSubmit={onSubmit} className="auth-form">
        {successMessage ? <p className="auth-message success-message">{successMessage}</p> : null}
        {errorMessage ? <p className="auth-message error-message">{errorMessage}</p> : null}

        <label className="field">
          <span>Email address</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            className={errors.email ? 'input-error' : ''}
            onChange={(event) => onFieldChange('email', event.target.value)}
          />
          {errors.email ? <span className="error-text">{errors.email}</span> : null}
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            placeholder="********"
            value={form.password}
            className={errors.password ? 'input-error' : ''}
            onChange={(event) => onFieldChange('password', event.target.value)}
          />
          {errors.password ? <span className="error-text">{errors.password}</span> : null}
        </label>

        <div className="form-meta">
          <button type="button" className="ghost-link">
            Forgot password?
          </button>
        </div>

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="separator">
          <span>or</span>
        </div>

        <button type="button" className="secondary-button">
          Continue with Google
        </button>

        <p className="switch-copy">
          No account?{' '}
          <button type="button" className="inline-link" onClick={onSwitchMode}>
            Create one free
          </button>
        </p>
      </form>
    </>
  );
}

export default Login;
