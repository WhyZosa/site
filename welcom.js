document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы страницы
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

    // Получаем данные пользователя из localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.name) {
        // Если пользователь авторизован, отображаем его имя и email
        userNameElement.textContent = user.name;
        userNameInDropdown.textContent = user.name;
        userEmailInDropdown.textContent = user.email;
        userEmailInDropdown.style.display = 'block'; // Показываем почту
    } else {
        // Если пользователь не авторизован, отображаем "Гость" и скрываем email
        userNameElement.textContent = 'Гость';
        userNameInDropdown.textContent = 'Гость';
        userEmailInDropdown.style.display = 'none'; // Скрываем почту
    }

    // Отображение курсов пользователя
    if (user && user.courses && user.courses.length > 0) {
        user.courses.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.className = 'course-item';
            courseElement.textContent = course.name;
            coursesContainer.appendChild(courseElement);
        });
    } else {
        coursesContainer.textContent = user ? 'У вас пока нет курсов.' : 'Пожалуйста, войдите, чтобы просмотреть ваши курсы.';
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
        if (user) {
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});
