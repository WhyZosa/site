document.addEventListener('DOMContentLoaded', function() {
    // Обработка формы регистрации
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registration-name').value;
            const email = document.getElementById('registration-email').value;
            const password = document.getElementById('registration-password').value;
            const errorMessage = document.getElementById('registration-error');

            if (name && email && password) {
                // Имитация отправки данных на сервер
                fetch('https://your-api.com/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Сохранение данных пользователя в localStorage
                        localStorage.setItem('user', JSON.stringify({
                            name: name,
                            email: email,
                            courses: [] // Пустой массив для курсов
                        }));
                        // Перенаправление на страницу входа
                        window.location.href = 'index.html';
                    } else {
                        errorMessage.textContent = 'Ошибка регистрации: ' + data.message;
                    }
                })
                .catch(error => {
                    errorMessage.textContent = 'Произошла ошибка: ' + error.message;
                });
            } else {
                errorMessage.textContent = 'Пожалуйста, заполните все поля.';
            }
        });
    }

    // Обработка формы входа
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorMessage = document.getElementById('login-error');

            if (email && password) {
                // Имитация проверки на сервере
                fetch('https://your-api.com/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Сохранение токена и данных пользователя в localStorage
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        // Перенаправление на страницу приветствия
                        window.location.href = 'welcome.html';
                    } else {
                        errorMessage.textContent = 'Ошибка входа: ' + data.message;
                    }
                })
                .catch(error => {
                    errorMessage.textContent = 'Произошла ошибка: ' + error.message;
                });
            } else {
                errorMessage.textContent = 'Пожалуйста, заполните все поля.';
            }
        });
    }
});
