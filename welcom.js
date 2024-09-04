document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const profileMenu = document.querySelector('.profile-menu');
    const dropdownMenu = document.getElementById('dropdown-menu');

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
        window.location.href = 'index.html'; // Перенаправление на страницу входа
    });

    // Обработка нажатия на кнопку "Проанализировать"
    document.getElementById('analyze-btn').addEventListener('click', function() {
        const fileUploadContainer = document.getElementById('file-upload-container');
        fileUploadContainer.style.display = 'block'; // Показать форму для загрузки файла
    });

    // Обработка загрузки файла
    document.getElementById('upload-file-btn').addEventListener('click', function() {
        const fileInput = document.getElementById('file-input');
        if (fileInput.files.length === 0) {
            alert('Пожалуйста, выберите файл.');
            return;
        }

        const file = fileInput.files[0];
        console.log("Файл выбран:", file.name);
        uploadFile(file, token);
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
    fetch('https://your-api.com/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Используем токен для загрузки профиля
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Ответ сервера:", data);
        if (data.success) {
            document.getElementById('welcome-user-name').textContent = data.user.name;
            document.getElementById('profile-avatar').src = data.user.avatar || 'default-avatar.png';
            document.getElementById('user-name').textContent = data.user.name;
            document.getElementById('user-email').textContent = data.user.email;
            document.getElementById('user-email').style.display = 'block';
            document.getElementById('courses-message').style.display = 'none'; // Скрываем сообщение для гостей
            document.getElementById('courses-container').style.display = 'flex'; // Показываем кнопки для авторизованных
            console.log("Профиль пользователя загружен успешно.");
        } else {
            alert('Ошибка при загрузке профиля: ' + data.message);
            showGuestView(); // Показываем интерфейс для гостей при ошибке
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке профиля:', error);
        showGuestView(); // Показываем интерфейс для гостей при ошибке
    });
}

// Функция для загрузки файла на сервер
function uploadFile(file, token) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('https://your-api.com/upload-file', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Ответ сервера после загрузки файла:", data);
        if (data.success) {
            alert('Файл успешно загружен и обработан!');
            window.location.href = 'dashboard.html'; // Перенаправление на дашборд
        } else {
            alert('Ошибка при загрузке файла: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке файла:', error);
        alert('Произошла ошибка при загрузке файла.');
    });
}
