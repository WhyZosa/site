document.addEventListener('DOMContentLoaded', function() {
    // Проверка страницы входа
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorMessage = document.getElementById('login-error');

            if (email && password) {
                // Здесь можно добавить проверку на стороне клиента
                // Отправка данных на сервер для проверки
                // Для примера просто перенаправляем на приветственную страницу
                window.location.href = 'welcome.html';
            } else {
                errorMessage.textContent = 'Пожалуйста, заполните все поля.';
            }
        });
    }

    // Проверка страницы регистрации
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registration-name').value;
            const email = document.getElementById('registration-email').value;
            const password = document.getElementById('registration-password').value;
            const errorMessage = document.getElementById('registration-error');

            if (name && email && password) {
                // Отправка данных на сервер
                fetch('https://', {
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
                        // Перенаправление на страницу входа после успешной регистрации
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
});
