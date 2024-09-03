document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        window.location.href = 'index.html'; // Перенаправляем на страницу входа, если нет токена
        return;
    }

    const profileNameInput = document.getElementById('profile-name');
    const profileEmailInput = document.getElementById('profile-email');
    const editButton = document.getElementById('edit-profile');
    const saveButton = document.getElementById('save-profile');
    const profileForm = document.getElementById('profile-form');
    const logoutButton = document.getElementById('logout');
    const profileIcon = document.getElementById('profile-icon');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const themeSelect = document.getElementById('theme-select');
    const languageSelect = document.getElementById('language-select');
    const applySettingsButton = document.getElementById('apply-settings');

    // Функция для обновления отображения данных профиля
    function updateUserNameAndEmail(name, email) {
        document.getElementById('user-name').textContent = name || 'Гость';
        document.getElementById('user-email').textContent = email || '';
        document.getElementById('user-email').style.display = email ? 'block' : 'none';
        profileNameInput.value = name || 'Гость';
        profileEmailInput.value = email || '';
    }

    // Получение данных профиля с сервера
    function fetchUserProfile() {
        if (token) {
            fetch('https://your-api.com/user-profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(user => {
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
        } else {
            updateUserNameAndEmail(null, null);
        }
    }

    // Сохранение изменений на сервере
    function saveUserProfile() {
        const name = profileNameInput.value;
        const email = profileEmailInput.value;

        if (token) {
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
                    updateUserNameAndEmail(name, email);
                    toggleEditMode(false);
                } else {
                    alert('Ошибка при обновлении профиля: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Ошибка при обновлении профиля:', error);
            });
        } else {
            alert('Вы не авторизованы. Сохранение данных невозможно.');
        }
    }

    // Переключение между режимом редактирования и просмотра
    function toggleEditMode(editMode) {
        profileForm.style.display = editMode ? 'block' : 'none';
        saveButton.style.display = editMode ? 'block' : 'none';
        editButton.style.display = editMode ? 'none' : 'block';
    }

    // Инициализация данных профиля
    fetchUserProfile();

    // Обработка клика на иконку профиля
    profileIcon.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    });

    // Обработка кнопки "Изменить"
    editButton.addEventListener('click', () => {
        toggleEditMode(true);
    });

    // Обработка формы профиля
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveUserProfile();
    });

    // Функция для применения темы
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else if (theme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        } else {
            document.body.classList.remove('dark-theme', 'light-theme');
        }
    }

    // Функция для применения языка
    function applyLanguage(language) {
        const elements = document.querySelectorAll('[data-lang]');
        elements.forEach(element => {
            element.textContent = element.dataset[language] || element.dataset['ru'];
        });
    }

    // Обработка настроек
    applySettingsButton.addEventListener('click', () => {
        const selectedTheme = themeSelect.value;
        const selectedLanguage = languageSelect.value;

        applyTheme(selectedTheme);
        applyLanguage(selectedLanguage);

        alert(`Тема применена: ${selectedTheme}, Язык: ${selectedLanguage}`);
    });

    // Обработка выхода из системы
    logoutButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
});
