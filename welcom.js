document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userNameElement = document.getElementById('welcome-user-name');
    const coursesContainer = document.getElementById('courses-container');
    const userNameInDropdown = document.getElementById('user-name');
    const userEmailInDropdown = document.getElementById('user-email');
    const profileMenu = document.querySelector('.profile-menu');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const changeAvatarButton = document.getElementById('change-avatar-btn');
    const avatarInput = document.getElementById('avatar-input');
    const avatarImage = document.getElementById('profile-avatar');
    const dropdownAvatar = document.getElementById('dropdown-avatar');
    const logoutButton = document.getElementById('logout-btn');

    if (token) {
        fetch('https://your-api.com/user-profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(user => {
            if (!user) {
                showGuestView();
                return;
            }

            // Отображаем данные пользователя
            userNameElement.textContent = user.name;
            userNameInDropdown.textContent = user.name;
            userEmailInDropdown.textContent = user.email;
            userEmailInDropdown.style.display = 'block';

            // Отображение курсов пользователя
            if (user.courses && user.courses.length > 0) {
                user.courses.forEach(course => {
                    const courseElement = document.createElement('div');
                    courseElement.className = 'course-item';
                    courseElement.textContent = course.name;
                    coursesContainer.appendChild(courseElement);
                });
            } else {
                coursesContainer.textContent = 'У вас пока нет курсов.';
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных пользователя:', error);
            showGuestView(); // В случае ошибки отображаем гостевой интерфейс
        });
    } else {
        showGuestView(); // Если токена нет, отображаем гостевой интерфейс
    }

    function showGuestView() {
        userNameElement.textContent = 'Гость';
        userNameInDropdown.textContent = 'Гость';
        userEmailInDropdown.style.display = 'none';
        coursesContainer.textContent = 'Пожалуйста, войдите, чтобы просмотреть ваши курсы.';
    }

    // Логика работы с меню профиля
    profileMenu.addEventListener('click', () => {
        dropdownMenu.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
        if (!profileMenu.contains(event.target) && dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
        }
    });

    // Изменение аватара пользователя
    changeAvatarButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (token) {
            avatarInput.click();
        } else {
            alert('Пожалуйста, войдите, чтобы изменить аватар.');
        }
    });

    avatarInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarImage.src = e.target.result;
                dropdownAvatar.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Логика выхода из системы
    logoutButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
