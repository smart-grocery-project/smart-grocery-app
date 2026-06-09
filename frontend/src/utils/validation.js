const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(form) {
  const errors = {
    email: '',
    password: '',
  };

  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!emailPattern.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.password.trim()) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export function validateRegister(form) {
  const errors = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!emailPattern.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}
