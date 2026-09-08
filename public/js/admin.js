document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const login = document.getElementById('adminLogin').value.trim();
            const password = document.getElementById('adminPassword').value;

            if (!login || !password) {
                alert('Пожалуйста, заполните все поля.');
                return;
            }

            console.log('Вход администратора:', { login });

            alert('Вход выполнен успешно!');
            window.location.href = 'dashboard.html';
        });
    }

    const adminLogout = document.getElementById('adminLogout');
    if (adminLogout) {
        adminLogout.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Вы вышли из панели управления.');
            window.location.href = 'login.html';
        });
    }
});