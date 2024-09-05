document.addEventListener('DOMContentLoaded', function() {
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
    const token = localStorage.getItem('token');

    function updateUserNameAndEmail(name, email) {
        document.getElementById('user-name').textContent = name || 'Гость';
        document.getElementById('welcome-user-name').textContent = name || 'Гость';
        document.getElementById('user-email').textContent = email || '';
        document.getElementById('user-email').style.display = email ? 'block' : 'none';
        userNameInDropdown.value = name || 'Гость';
        userEmailInDropdown.value = email || '';
    }
    profileAvatar.addEventListener('click', () => {
        dropdownMenu.style.display="block"
        dropdownMenu.classList.toggle('active');
    });

    const myCoursesBtn = document.createElement('a');
    myCoursesBtn.href = "/courses";
    myCoursesBtn.className = "btn primary-btn";
    myCoursesBtn.textContent = "Перейти в Мои Курсы";

    if (token) {
        fetch('http://127.0.0.1:8000/api/user/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                console.log(data)
                updateUserNameAndEmail(data.user.username,data.user.email)
                if (data.user.avatarUrl) {
                    avatar.src = data.user.avatarUrl;
                }
                coursesMessage.textContent = ""; // Очистка сообщения
                coursesContainer.appendChild(myCoursesBtn);
                console.log(coursesMessage.textContent)
            } else {
                showGuestView()
            }
        })
        .catch(error => {
            console.error('Ошибка при проверке токена:', error);
            //localStorage.removeItem('token');
        });
    }

    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('token');
    });

    document.addEventListener('click', (event) => {
        if (!profileMenu.contains(event.target) && dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
            dropdownMenu.style.display="none"
        }
    });
    function showGuestView() {
        userNameElement.textContent = 'Гость';
        userNameInDropdown.textContent = 'Гость';
        userEmailInDropdown.style.display = 'none';
        coursesMessage.innerHTML = 'Пожалуйста, <a href="index.html" class="highlight-link">войдите</a>, чтобы просмотреть ваши курсы.';
    }
});

