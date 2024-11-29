// Toggle between Login and Sign-Up forms
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

loginTab.addEventListener('click', () => {
  loginTab.classList.add('bg-blue-500', 'text-white');
  signupTab.classList.remove('bg-blue-500', 'text-white');
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
});

signupTab.addEventListener('click', () => {
  signupTab.classList.add('bg-blue-500', 'text-white');
  loginTab.classList.remove('bg-blue-500', 'text-white');
  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
});

// Handle Sign-Up Form submission
signupForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = event.target.signupUsername.value;
  const password = event.target.signupPassword.value;
  const confirmPassword = event.target.confirmPassword.value;
  const role = event.target.signupRole.value;

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  // Redirect to appropriate dashboard
  if (role === 'Artist') {
    window.location.href = 'artist_dashboard.html';
  } else {
    window.location.href = 'visitor_dashboard.html';
  }

  // Clear form
  event.target.reset();
});

// Handle Log-In Form submission
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = event.target.loginUsername.value;
  const password = event.target.loginPassword.value;
  const role = event.target.loginRole.value;

  // Redirect to appropriate dashboard
  if (role === 'Artist') {
    window.location.href = 'artist_dashboard.html';
  } else {
    window.location.href = 'visitor_dashboard.html';
  }

  // Clear form
  event.target.reset();
});