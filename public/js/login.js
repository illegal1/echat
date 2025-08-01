// filepath: d:\projects\echat\public\login.js
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
        const res = await axios.post('/api/login', { username, password });
        // Redirect or show success
        window.location.href = '/';
    } catch (err) {
        alert('Signup failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
});