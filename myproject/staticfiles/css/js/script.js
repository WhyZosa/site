document.addEventListener('DOMContentLoaded', function() {
    // Обработка формы входа
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorMessage = document.getElementById('login-error');

            if (email && password) {
                // Отправка данных на сервер для проверки
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
                        // Перенаправление на страницу приветствия с токеном в URL
                        window.location.href = `welcome.html?token=${data.token}`;
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
