function Register({
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
        <h2>Create account</h2>
        <p>Start managing your food budget with a smarter grocery planner.</p>
      </div>

      <form onSubmit={onSubmit} className="auth-form">
        {successMessage ? <p className="auth-message success-message">{successMessage}</p> : null}
        {errorMessage ? <p className="auth-message error-message">{errorMessage}</p> : null}

        <label className="field">
          <span>Full name</span>
          <input
            type="text"
            placeholder="John Doe"
            value={form.fullName}
            className={errors.fullName ? 'input-error' : ''}
            onChange={(event) => onFieldChange('fullName', event.target.value)}
          />
          {errors.fullName ? <span className="error-text">{errors.fullName}</span> : null}
        </label>

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

        <label className="field">
          <span>Confirm password</span>
          <input
            type="password"
            placeholder="********"
            value={form.confirmPassword}
            className={errors.confirmPassword ? 'input-error' : ''}
            onChange={(event) => onFieldChange('confirmPassword', event.target.value)}
          />
          {errors.confirmPassword ? (
            <span className="error-text">{errors.confirmPassword}</span>
          ) : null}
        </label>

        <div className="form-meta">
          <button type="button" className="ghost-link">
            Password rules
          </button>
        </div>

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <div className="separator">
          <span>or</span>
        </div>

        <button type="button" className="secondary-button">
          Continue with Google
        </button>

        <p className="switch-copy">
          Already have an account?{' '}
          <button type="button" className="inline-link" onClick={onSwitchMode}>
            Sign in
          </button>
        </p>
      </form>
    </>
  );
}

export default Register;
