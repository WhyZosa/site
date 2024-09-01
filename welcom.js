document.addEventListener('DOMContentLoaded', function() {
    const userNameSpan = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout');
    const avatar = document.getElementById('avatar');

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
    } else {
        fetch('https://your-api.com/verify-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                userNameSpan.textContent = data.user.name;
                // Установить аватар, если есть
                if (data.user.avatarUrl) {
                    avatar.src = data.user.avatarUrl;
                }
            } else {
                localStorage.removeItem('token');
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Ошибка при проверке токена:', error);
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }

    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});
