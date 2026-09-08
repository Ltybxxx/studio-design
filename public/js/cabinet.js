document.addEventListener('DOMContentLoaded', async function() {
    // Ждём инициализацию хедера
    setTimeout(async function() {
        // Проверяем авторизацию
        if (!auth.requireAuth()) {
            return;
        }

        await db.init();

        const currentUser = auth.getCurrentUser();
        
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Заполняем приветствие
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Добро пожаловать, ${currentUser.name}!`;
        }

        // Заполняем информацию о пользователе в сайдбаре
        const cabinetUserInfo = document.getElementById('cabinetUserInfo');
        if (cabinetUserInfo) {
            const firstLetter = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?';
            cabinetUserInfo.innerHTML = `
                <div class="cabinet-avatar">${firstLetter}</div>
                <div>
                    <p class="cabinet-user-name">${escapeHtml(currentUser.name)}</p>
                    <p class="cabinet-user-email">${escapeHtml(currentUser.email)}</p>
                </div>
            `;
        }

        // Заполняем форму профиля
        document.getElementById('profileName').value = currentUser.name || '';
        document.getElementById('profileEmail').value = currentUser.email || '';
        document.getElementById('profilePhone').value = currentUser.phone || '';

        // Обработка формы профиля
        const profileForm = document.getElementById('profileForm');
        const successAlert = document.getElementById('successAlert');
        const errorAlert = document.getElementById('errorAlert');
        const errorList = document.getElementById('errorList');

        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            successAlert.style.display = 'none';
            errorAlert.style.display = 'none';
            errorList.innerHTML = '';

            const name = document.getElementById('profileName').value.trim();
            const email = document.getElementById('profileEmail').value.trim();
            const phone = document.getElementById('profilePhone').value.trim();

            const result = db.updateUser(currentUser.id, name, email, phone);

            if (result.success) {
                auth.setCurrentUser(result.user);
                successAlert.style.display = 'block';
                
                // Обновляем приветствие
                welcomeMessage.textContent = `Добро пожаловать, ${result.user.name}!`;
                
                // Обновляем информацию в сайдбаре
                const firstLetter = result.user.name.charAt(0).toUpperCase();
                cabinetUserInfo.innerHTML = `
                    <div class="cabinet-avatar">${firstLetter}</div>
                    <div>
                        <p class="cabinet-user-name">${escapeHtml(result.user.name)}</p>
                        <p class="cabinet-user-email">${escapeHtml(result.user.email)}</p>
                    </div>
                `;
                
                // Обновляем хедер
                if (window.updateHeaderActions) {
                    window.updateHeaderActions();
                }
            } else {
                errorAlert.style.display = 'block';
                const li = document.createElement('li');
                li.textContent = result.message;
                errorList.appendChild(li);
            }
        });

        // Загружаем заявки пользователя
        const requestsList = document.getElementById('requestsList');
        const userRequests = db.getUserRequests(currentUser.id);

        if (userRequests.length === 0) {
            requestsList.innerHTML = `
                <div class="empty-state">
                    <p>У вас пока нет заявок.</p>
                    <a href="request.html" class="btn btn-primary">Оставить заявку</a>
                </div>
            `;
        } else {
            const statusLabels = {
                'new': 'Новая',
                'processing': 'В обработке',
                'awaiting': 'Ожидает уточнения',
                'accepted': 'Принята',
                'completed': 'Завершена',
                'cancelled': 'Отменена'
            };

            requestsList.innerHTML = '<div class="requests-list">' + 
                userRequests.map(function(request) {
                    const statusLabel = statusLabels[request.status] || request.status;
                    const createdDate = new Date(request.created_at).toLocaleDateString('ru-RU');
                    
                    return `
                        <div class="request-item">
                            <div class="request-header">
                                <h3>Заявка #${request.id}</h3>
                                <span class="status status-${request.status}">${statusLabel}</span>
                            </div>
                            <p><strong>Тип помещения:</strong> ${request.room_type || 'Не указано'}</p>
                            <p><strong>Услуга:</strong> ${request.service_type || 'Не указано'}</p>
                            <p><strong>Дата:</strong> ${createdDate}</p>
                        </div>
                    `;
                }).join('') + 
            '</div>';
        }

        // Обработка вкладок
        const tabLinks = document.querySelectorAll('.cabinet-menu a[data-tab]');

        tabLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                tabLinks.forEach(function(l) {
                    l.classList.remove('active');
                });

                link.classList.add('active');

                const tabId = link.getAttribute('data-tab');
                const tabContents = document.querySelectorAll('.tab-content');

                tabContents.forEach(function(content) {
                    content.classList.remove('active');
                });

                const targetTab = document.getElementById('tab-' + tabId);
                if (targetTab) {
                    targetTab.classList.add('active');
                }
            });
        });
    }, 200);
});