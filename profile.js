document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const profileForm = document.getElementById('profile-form');
    const logoutButton = document.getElementById('logout');

    // Заполняем форму данными пользователя
    document.getElementById('profile-name').value = user.name;
    document.getElementById('profile-email').value = user.email;

    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('profile-name').value;
        const email = document.getElementById('profile-email').value;

        // Имитация обновления данных на сервере
        fetch('https://your-api.com/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Обновляем данные в localStorage
                user.name = name;
                user.email = email;
                localStorage.setItem('user', JSON.stringify(user));
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});
