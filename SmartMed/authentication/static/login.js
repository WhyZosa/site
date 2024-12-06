document.addEventListener('DOMContentLoaded', function() {
    // Переменные для форм
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleRegisterLink = document.getElementById('toggle-register');
    const toggleLoginLink = document.getElementById('toggle-login');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');
    const passwordStrengthText = document.getElementById('password-strength');
    const passwordMatchText = document.getElementById('password-match');

    // Переключение видимости пароля для логина
    const toggleLoginPasswordVisibility = document.getElementById('toggle-login-password-visibility');
    const loginPasswordInput = document.getElementById('login-password');
    if (toggleLoginPasswordVisibility && loginPasswordInput) {
        toggleLoginPasswordVisibility.addEventListener('click', () => {
            if (loginPasswordInput.type === 'password') {
                loginPasswordInput.type = 'text';
                toggleLoginPasswordVisibility.textContent = '🙈'; // Меняем на "закрытый глаз"
            } else {
                loginPasswordInput.type = 'password';
                toggleLoginPasswordVisibility.textContent = '👁️'; // Меняем на "открытый глаз"
            }
        });
    }

    // Переключение видимости пароля для регистрации
    const toggleRegisterPasswordVisibility = document.getElementById('toggle-register-password-visibility');
    if (toggleRegisterPasswordVisibility && passwordInput) {
        toggleRegisterPasswordVisibility.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleRegisterPasswordVisibility.textContent = '🙈'; // Меняем на "закрытый глаз"
            } else {
                passwordInput.type = 'password';
                toggleRegisterPasswordVisibility.textContent = '👁️'; // Меняем на "открытый глаз"
            }
        });
    }

    // Переключение видимости форм
    if (toggleRegisterLink) {
        toggleRegisterLink.addEventListener('click', () => {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        });
    }

    if (toggleLoginLink) {
        toggleLoginLink.addEventListener('click', () => {
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }

    // Проверка сложности пароля
    function checkPasswordStrength(password) {
        const strengthRegex = {
            strong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            medium: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/
        };

        if (strengthRegex.strong.test(password)) {
            return 'strong';
        } else if (strengthRegex.medium.test(password)) {
            return 'medium';
        } else {
            return 'weak';
        }
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strength = checkPasswordStrength(password);

            if (strength === 'strong') {
                passwordStrengthText.textContent = 'Сложность пароля: сильный';
                passwordStrengthText.style.color = 'green';
            } else if (strength === 'medium') {
                passwordStrengthText.textContent = 'Сложность пароля: средний';
                passwordStrengthText.style.color = 'orange';
            } else {
                passwordStrengthText.textContent = 'Сложность пароля: слабый';
                passwordStrengthText.style.color = 'red';
            }
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (password === confirmPassword) {
                passwordMatchText.textContent = 'Пароли совпадают';
                passwordMatchText.style.color = 'green';
            } else {
                passwordMatchText.textContent = 'Пароли не совпадают';
                passwordMatchText.style.color = 'red';
            }
        });
    }

    // Логика для входа
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorMessage = document.getElementById('login-error');

            if (email && password) {
                fetch('http://127.0.0.1:8000/api/users/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: {
                            email: email,
                            password: password
                        }
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ошибка входа: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Response from server:', data);
                    if (data && data.user && data.user.token) {
                        // Сохранение токена без лишних символов
                        const token = data.user.token.replace(/^b['"]|['"]$/g, '');
                        localStorage.setItem('token', token);
                        window.location.href = '/';
                    } else {
                        errorMessage.textContent = 'Ошибка входа: ' + (data.message || 'неверные данные');
                    }
                })
                .catch(error => {
                    console.error('Произошла ошибка:', error);
                    errorMessage.textContent = 'Произошла ошибка: ' + error.message;
                });
            } else {
                errorMessage.textContent = 'Пожалуйста, заполните все поля.';
            }
        });
    }

    // Логика для регистрации
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const errorMessage = document.getElementById('registration-error');

            if (name && email && password) {
                fetch('http://127.0.0.1:8000/api/users/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: {
                            username: name,
                            email: email,
                            password: password
                        }
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ошибка регистрации: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Registration response:', data);
                    if (data && data.user) {
                        window.location.href = '/log';
                    } else {
                        errorMessage.textContent = 'Ошибка регистрации: ' + (data.message || 'неверные данные');
                    }
                })
                .catch(error => {
                    console.error('Произошла ошибка:', error);
                    errorMessage.textContent = 'Произошла ошибка: ' + error.message;
                });
            } else {
                errorMessage.textContent = 'Пожалуйста, заполните все поля.';
            }
        });
    }
});
