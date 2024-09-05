document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); // Используем токен из localStorage

    if (!token) {
        window.location.href = 'index.html'; // Перенаправляем на страницу входа, если нет токена
        return;
    }

    const profileNameInput = document.getElementById('profile-name');
    const profileEmailInput = document.getElementById('profile-email');
    const saveButton = document.getElementById('save-profile');
    const profileForm = document.getElementById('profile-form');
    const logoutButton = document.getElementById('logout');

    // Функция для обновления отображения данных профиля
    function updateUserNameAndEmail(name, email) {
        profileNameInput.value = name || 'Гость';
        profileEmailInput.value = email || '';
    }

    // Получение данных профиля с сервера
    function fetchUserProfile() {
        fetch('http://127.0.0.1:8000/api/user/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const user=data.user
            if (user && user.name) {
                updateUserNameAndEmail(user.name, user.email);
            } else {
                updateUserNameAndEmail(null, null);
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке профиля:', error);
            updateUserNameAndEmail(null, null);
        });
    }

    // Сохранение изменений на сервере
    function saveUserProfile() {
        const name = profileNameInput.value;
        const email = profileEmailInput.value;

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
    }

    // Инициализация данных профиля
    fetchUserProfile();

    // Обработка формы профиля
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveUserProfile();
    });

    // Обработка выхода из системы
    logoutButton.addEventListener('click', function() {
        localStorage.clear(); // Очищаем токен
        window.location.href = 'index.html';
    });
});