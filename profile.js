document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    fetch('https://your-api.com/user-profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(user => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        // Заполняем форму данными пользователя
        document.getElementById('profile-name').value = user.name;
        document.getElementById('profile-email').value = user.email;

        const profileForm = document.getElementById('profile-form');
        const logoutButton = document.getElementById('logout');

        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('profile-name').value;
            const email = document.getElementById('profile-email').value;

            // Обновление данных пользователя на сервере
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
                } else {
                    alert('Ошибка при обновлении профиля: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Ошибка при обновлении профиля:', error);
            });
        });

        logoutButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    })
    .catch(error => {
        console.error('Ошибка при загрузке профиля:', error);
        window.location.href = 'index.html';
    });
});
