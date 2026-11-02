/* ============================================
   AUTH PAGE LOGIC – Login / Register
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Check if already "logged in"
  if (localStorage.getItem('ig_logged_in') === 'true') {
    window.location.href = 'home.html';
    return;
  }

  const loginBox = document.getElementById('login-box');
  const registerBox = document.getElementById('register-box');
  const loginSwitch = document.querySelector('.auth-switch-box:not(#register-switch-box)');
  const registerSwitch = document.getElementById('register-switch-box');

  // Toggle to Register
  document.getElementById('show-register').addEventListener('click', () => {
    loginBox.style.display = 'none';
    loginSwitch.style.display = 'none';
    registerBox.style.display = 'block';
    registerSwitch.style.display = 'block';

    // Animate in
    registerBox.style.animation = 'fadeInUp 0.4s ease';
    registerSwitch.style.animation = 'fadeInUp 0.4s ease 0.1s both';
  });

  // Toggle to Login
  document.getElementById('show-login').addEventListener('click', () => {
    registerBox.style.display = 'none';
    registerSwitch.style.display = 'none';
    loginBox.style.display = 'block';
    loginSwitch.style.display = 'block';

    loginBox.style.animation = 'fadeInUp 0.4s ease';
    loginSwitch.style.animation = 'fadeInUp 0.4s ease 0.1s both';
  });

  // Login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    if (!username || !password) {
      errorEl.textContent = 'Please fill in all fields.';
      return;
    }

    if (password.length < 8) {
      errorEl.textContent = 'Password must be at least 8 characters.';
      return;
    }

    errorEl.textContent = '';
    const btn = document.getElementById('login-btn');
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('ig_logged_in', 'true');
        localStorage.setItem('refresh_token', data.refresh_token);
        window.location.href = 'home.html';
      } else {
        errorEl.textContent = data.detail || 'Login failed.';
        btn.textContent = 'Log In';
        btn.disabled = false;
      }
    } catch (err) {
      errorEl.textContent = 'Network error. Please try again.';
      btn.textContent = 'Log In';
      btn.disabled = false;
    }
  });

  // Register form
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reg-email').value.trim();
    const fullname = document.getElementById('reg-fullname').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const dob = document.getElementById('reg-dob').value;
    const password = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('register-error');

    if (!email || !fullname || !username || !password) {
      errorEl.textContent = 'Please fill in all required fields.';
      return;
    }

    if (password.length < 8) {
      errorEl.textContent = 'Password must be at least 8 characters.';
      return;
    }

    if (username.length < 3) {
      errorEl.textContent = 'Username must be at least 3 characters.';
      return;
    }

    errorEl.textContent = '';
    const btn = document.getElementById('register-btn');
    btn.textContent = 'Creating account...';
    btn.disabled = true;

    try {
      const payload = {
        username: username,
        full_name: fullname,
        email: email,
        password: password,
        phone_no: phone || null,
        dob: dob || null,
        bio: "",
        role_id: 1, // 1 is the regular user role
        created_at: new Date().toISOString()
      };

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        // Auto-login after successful registration
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData
        });

        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem('ig_logged_in', 'true');
          localStorage.setItem('refresh_token', loginData.refresh_token);
          window.location.href = 'home.html';
        } else {
          window.location.reload();
        }
      } else {
        errorEl.textContent = data.detail || 'Registration failed.';
        btn.textContent = 'Sign Up';
        btn.disabled = false;
      }
    } catch (err) {
      errorEl.textContent = 'Network error. Please try again.';
      btn.textContent = 'Sign Up';
      btn.disabled = false;
    }
  });

  // Enable/disable button based on input
  const loginInputs = document.querySelectorAll('#login-form input');
  loginInputs.forEach(input => {
    input.addEventListener('input', () => {
      const username = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      document.getElementById('login-btn').disabled = !(username && password.length >= 1);
    });
  });

  const regInputs = document.querySelectorAll('#register-form input');
  regInputs.forEach(input => {
    input.addEventListener('input', () => {
      const email = document.getElementById('reg-email').value.trim();
      const fullname = document.getElementById('reg-fullname').value.trim();
      const username = document.getElementById('reg-username').value.trim();
      const password = document.getElementById('reg-password').value;
      document.getElementById('register-btn').disabled = !(email && fullname && username && password);
    });
  });
});
