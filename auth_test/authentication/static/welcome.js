document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const profileMenu = document.querySelector('.profile-menu');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const fileUploadContainer = document.getElementById('file-upload-container');

    // Проверка авторизации
    if (!token) {
        console.log("Пользователь не авторизован. Показываем гостевой интерфейс.");
        showGuestView(); // Показываем интерфейс для неавторизованных
    } else {
        console.log("Пользователь авторизован. Загружаем профиль.");
        loadUserProfile(token); // Загружаем профиль пользователя
    }

    // Открытие и закрытие меню профиля
    profileMenu.addEventListener('click', () => {
        dropdownMenu.classList.toggle('active');
    });

    // Закрытие меню, если пользователь кликает вне его
    document.addEventListener('click', (event) => {
        if (!profileMenu.contains(event.target) && dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
        }
    });

    // Логика выхода из системы
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.clear(); // Удаляем токен
        window.location.href = '/'; // Перенаправление на страницу входа
    });

    // Обработка нажатия на кнопку "Анализировать"
    document.getElementById('analyze-btn').addEventListener('click', function() {
        window.location.href = 'analyze'; // Перенаправление на страницу анализа
    });
});

// Функция для отображения интерфейса для неавторизованных пользователей
function showGuestView() {
    document.getElementById('welcome-user-name').textContent = 'Гость';
    document.getElementById('courses-message').style.display = 'block'; // Показываем сообщение для гостей
    document.getElementById('courses-container').style.display = 'none'; // Скрываем кнопки для авторизованных
    console.log("Интерфейс для гостей показан.");
}

// Функция для загрузки профиля пользователя
function loadUserProfile(token) {
console.log(token)
    fetch('http://127.0.0.1:8000/api/user/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}` // Используем токен для загрузки профиля
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Ответ сервера:", data);
        if (data&&data.user.username) {
            document.getElementById('welcome-user-name').textContent = data.user.username;
            document.getElementById('user-name').textContent = data.user.username;
            document.getElementById('user-email').textContent = data.user.email;
            document.getElementById('user-email').style.display = 'block';
            document.getElementById('courses-message').style.display = 'none'; // Скрываем сообщение для гостей
            document.getElementById('courses-container').style.display = 'flex'; // Показываем кнопки для авторизованных
            console.log("Профиль пользователя загружен успешно.");
        } else {
            showGuestView(); // Показываем интерфейс для гостей при ошибке
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке профиля:', token);
        showGuestView(); // Показываем интерфейс для гостей при ошибке
    });
}