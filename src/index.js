// index.js

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('googleLoginBtn');

  if (!loginBtn) {
    console.error('Google login button not found');
    return;
  }

  loginBtn.addEventListener('click', () => {
    // Replace with your actual backend Google OAuth endpoint
    // This should match what you set in GOOGLE_CALLBACK_URL in backend .env
    const backendUrl = 'https://litetransf-backend.onrender.com'; // ← CHANGE THIS
    // or for local dev: 'http://localhost:3000'

    const googleAuthUrl = `${backendUrl}/auth/google`;

    // Optional: You can add loading state
    loginBtn.textContent = 'Redirecting...';
    loginBtn.disabled = true;

    window.location.href = googleAuthUrl;
  });
});