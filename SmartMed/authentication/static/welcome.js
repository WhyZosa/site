document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const profileBtn = document.getElementById('profile-btn');
    const searchCoursesBtn = document.getElementById('search-courses-btn');
    const modulesBtn = document.getElementById('modules-btn');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginPrompt = document.getElementById('login-prompt');
    const welcomeText = document.getElementById('welcome-text');

    // Проверка токена для авторизации
    if (token) {
        loadUserProfile(token); // Загружаем профиль пользователя
    } else {
        showGuestView(); // Показываем интерфейс для гостей
    }

    // Функция для отображения интерфейса для гостей
    function showGuestView() {
        profileBtn.style.display = 'none';
        searchCoursesBtn.style.display = 'none';
        modulesBtn.style.display = 'none';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        loginPrompt.style.display = 'block';
        welcomeText.textContent = 'Анализируйте медицинские данные и исследуйте модули с «Smart-Медициной»';
    }

    // Функция для загрузки профиля пользователя
    function loadUserProfile(token) {
        fetch('http://127.0.0.1:8000/api/user/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.user && data.user.username) {
                profileBtn.style.display = 'inline-block';
                searchCoursesBtn.style.display = 'inline-block';
                modulesBtn.style.display = 'inline-block';
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'inline-block';
                loginPrompt.style.display = 'none';
                welcomeText.textContent = `Добро пожаловать, ${data.user.username}!`;
            } else {
                showGuestView();
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке профиля:', error);
            showGuestView();
        });
    }

    // Логика выхода из системы
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    });
});
