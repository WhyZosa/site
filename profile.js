document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'index.html'; // Перенаправление на страницу входа, если токена нет
        return;
    }

    // Получение данных профиля с использованием токена
    fetch('https://your-api.com/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Используем токен
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('profile-name').value = data.user.name;
            document.getElementById('profile-email').value = data.user.email;
        } else {
            alert('Ошибка при загрузке профиля: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке профиля:', error);
    });

    // Сохранение изменений профиля
    document.getElementById('save-profile').addEventListener('click', saveUserProfile);
});

function saveUserProfile() {
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    const token = localStorage.getItem('token');

    fetch('https://your-api.com/update-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Используем токен для обновления профиля
        },
        body: JSON.stringify({ name, email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Профиль успешно обновлен!');
        } else {
            alert('Ошибка при обновлении профиля: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка при обновлении профиля:', error);
    });
}

// Логика выхода из системы
document.getElementById('logout').addEventListener('click', function() {
    localStorage.clear(); // Удаляем токен
    window.location.href = 'index.html'; // Перенаправление на страницу входа
});
