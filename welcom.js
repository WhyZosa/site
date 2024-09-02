document.addEventListener('DOMContentLoaded', () => {
    const profileMenu = document.querySelector('.profile-menu');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const changeAvatarButton = document.getElementById('change-avatar-btn');
    const avatarInput = document.getElementById('avatar-input');
    const avatarImage = document.getElementById('profile-avatar');
    const dropdownAvatar = document.getElementById('dropdown-avatar');

    // Открытие и закрытие меню при клике
    profileMenu.addEventListener('click', () => {
        dropdownMenu.classList.toggle('active');
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', (event) => {
        if (!profileMenu.contains(event.target) && dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
        }
    });

    // Изменение аватара пользователя
    changeAvatarButton.addEventListener('click', (event) => {
        event.preventDefault();
        avatarInput.click();
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
});
