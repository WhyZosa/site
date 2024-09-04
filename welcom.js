document.addEventListener('DOMContentLoaded', () => {
    const userNameElement = document.getElementById('welcome-user-name');
    const coursesMessage = document.getElementById('courses-message');
    const coursesContainer = document.getElementById('courses-container');
    const userNameInDropdown = document.getElementById('user-name');
    const userEmailInDropdown = document.getElementById('user-email');
    const avatarInput = document.getElementById('avatar-input');
    const profileAvatar = document.getElementById('profile-avatar');
    const dropdownAvatar = document.getElementById('dropdown-avatar');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const profileMenu = document.querySelector('.profile-menu');
    const userToken = localStorage.getItem('token'); // Токен для авторизации
    
    // Форма для загрузки файла
    const fileUploadContainer = document.getElementById('file-upload-container');
    const fileInput = document.getElementById('file-input');
    const uploadFileBtn = document.getElementById('upload-file-btn');
    const analyzeBtn = document.getElementById('analyze-btn');

    // Проверка авторизации пользователя
    function getUserData() {
        if (userToken) {
            fetch('https://your-api.com/user-profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Сервер вернул ошибку');
                }
                return response.json();
            })
            .then(user => {
                if (user.name) {
                    userNameElement.textContent = user.name;
                    userNameInDropdown.textContent = user.name;
                    userEmailInDropdown.textContent = user.email;
                    userEmailInDropdown.style.display = 'block';
                    if (user.avatar) {
                        profileAvatar.src = user.avatar;
                        dropdownAvatar.src = user.avatar;
                    }
                    coursesMessage.style.display = 'none'; // Скрываем сообщение для гостей
                    coursesContainer.style.display = 'flex'; // Показываем кнопки
                } else {
                    showGuestView();
                }
            })
            .catch(error => {
                console.error('Ошибка при загрузке профиля:', error);
                showGuestView();
            });
        } else {
            showGuestView();
        }
    }

    // Отображение вида для гостя
    function showGuestView() {
        userNameElement.textContent = 'Гость';
        userNameInDropdown.textContent = 'Гость';
        userEmailInDropdown.style.display = 'none';
        coursesMessage.innerHTML = 'Пожалуйста, <a href="index.html" class="highlight-link">войдите</a>, чтобы просмотреть ваши курсы.';
        coursesContainer.style.display = 'none'; // Скрываем кнопки для гостей
    }

    // Обработка клика на кнопку "Проанализировать"
    analyzeBtn.addEventListener('click', () => {
        fileUploadContainer.style.display = 'block'; // Показать форму для загрузки файла
    });

    // Обработка отправки файла на сервер
    uploadFileBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) {
            alert('Выберите файл.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        fetch('https://your-api.com/analyze-excel', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userToken}`
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Файл успешно загружен и обработан!');
                window.location.href = 'dashboard.html'; // Перенаправление на дашборд
            } else {
                alert('Ошибка при анализе файла: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке файла:', error);
            alert('Произошла ошибка при загрузке файла.');
        });
    });

    // Загрузка данных пользователя при загрузке страницы
    getUserData();
});
