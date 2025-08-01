document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;
  const email = document.getElementById('signup-email').value;
  const repeatedPassword = document.getElementById(
    'signup-password-repeat',
  ).value;
  if (password !== repeatedPassword) return alert('Passwords are not match');
  try {
    const res = await axios.post('/api/signup', { username, password, email });
    window.location.href = '/';
  } catch (err) {
    console.log(err)
    alert('Signup failed: ' + (err.response?.data?.message || 'Unknown error'));
  }
});
