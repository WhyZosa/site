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
    const userToken = localStorage.getItem('token'); // Предположим, что токен хранится в localStorage

    // Создание кнопки "Перейти в Мои Курсы"
    const myCoursesBtn = document.createElement('a');
    myCoursesBtn.href = "my-courses.html";
    myCoursesBtn.className = "btn primary-btn";
    myCoursesBtn.textContent = "Перейти в Мои Курсы";

    // Проверка авторизации пользователя и загрузка данных с сервера
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
                    coursesMessage.textContent = ""; // Очистка сообщения
                    coursesContainer.appendChild(myCoursesBtn); // Добавляем кнопку "Перейти в Мои Курсы"
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
    }

    // Обработка клика на аватар для открытия меню профиля
    profileMenu.addEventListener('click', () => {
        dropdownMenu.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
        if (!profileMenu.contains(event.target) && dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
        }
    });

    // Обработка изменения аватара
    avatarInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);

            fetch('https://your-api.com/upload-avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.avatarUrl) {
                    profileAvatar.src = data.avatarUrl;
                    dropdownAvatar.src = data.avatarUrl;
                    alert('Аватар успешно обновлен!');
                } else {
                    alert('Ошибка при обновлении аватара: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Ошибка при загрузке аватара:', error);
                alert('Произошла ошибка при загрузке аватара.');
            });
        }
    });

    // Загрузка данных пользователя при загрузке страницы
    getUserData();
});
