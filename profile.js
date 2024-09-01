document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profile-form');
    const logoutButton = document.getElementById('logout');

    // Получаем токен из localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        // Если токен отсутствует, перенаправляем на страницу входа
        window.location.href = 'index.html';
    } else {
        // Проверка и загрузка данных пользователя
        fetch('https://your-api.com/user-profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Заполняем форму данными пользователя
                document.getElementById('profile-name').value = data.user.name;
                document.getElementById('profile-email').value = data.user.email;
            } else {
                // Токен недействителен, перенаправляем на страницу входа
                localStorage.removeItem('token');
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке профиля:', error);
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });

        // Обработка сохранения изменений
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('profile-name').value;
            const email = document.getElementById('profile-email').value;

            fetch('https://your-api.com/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Профиль обновлен!');
                } else {
                    alert('Ошибка при обновлении профиля: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Ошибка при обновлении профиля:', error);
            });
        });

        // Обработка выхода
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
});
