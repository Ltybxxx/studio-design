document.addEventListener('DOMContentLoaded', async function() {
    if (!document.querySelector('.header')) {
        createHeader();
    }
    
    if (!document.querySelector('.footer')) {
        createFooter();
    }
    
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        
        if (data.success) {
            updateHeaderForLoggedInUser(data.user);
        } else {
            updateHeaderForGuest();
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        updateHeaderForGuest();
    }
    
    initBurgerMenu();
});

function truncateName(name, maxLength) {
    if (!name) return '?';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
}

function createHeader() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const headerHTML = `
        <header class="header">
            <div class="container">
                <a href="/index.html" class="logo">
                    <span class="logo-icon">◆</span>
                    InteriorStudio
                </a>
                <nav class="nav" id="mainNav">
                    <ul class="nav-list">
                        <li><a href="/index.html" class="${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}">Главная</a></li>
                        <li><a href="/about.html" class="${currentPage === 'about.html' ? 'active' : ''}">О студии</a></li>
                        <li><a href="/services.html" class="${currentPage === 'services.html' ? 'active' : ''}">Услуги</a></li>
                        <li><a href="/portfolio.html" class="${currentPage === 'portfolio.html' ? 'active' : ''}">Портфолио</a></li>
                        <li><a href="/prices.html" class="${currentPage === 'prices.html' ? 'active' : ''}">Цены</a></li>
                        <li><a href="/reviews.html" class="${currentPage === 'reviews.html' ? 'active' : ''}">Отзывы</a></li>
                        <li><a href="/blog.html" class="${currentPage === 'blog.html' ? 'active' : ''}">Блог</a></li>
                        <li><a href="/contacts.html" class="${currentPage === 'contacts.html' ? 'active' : ''}">Контакты</a></li>
                    </ul>
                </nav>
                <div class="header-actions" id="headerActions"></div>
                <button class="burger-menu" id="burgerMenu" aria-label="Меню">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </header>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

function createFooter() {
    const footerHTML = `
        <footer class="footer">
            <div class="footer-top">
                <div class="container">
                    <div class="footer-grid">
                        <div class="footer-col footer-about">
                            <h3 class="footer-title">InteriorStudio</h3>
                            <p>Студия интерьерного дизайна и декора. Создаём красивые и функциональные пространства.</p>
                            <div class="footer-social">
                                <a href="#" class="social-link">TG</a>
                                <a href="#" class="social-link">WA</a>
                                <a href="#" class="social-link">IG</a>
                            </div>
                        </div>
                        <div class="footer-col">
                            <h3 class="footer-title">Навигация</h3>
                            <ul class="footer-links-list">
                                <li><a href="/index.html">Главная</a></li>
                                <li><a href="/about.html">О студии</a></li>
                                <li><a href="/services.html">Услуги</a></li>
                                <li><a href="/portfolio.html">Портфолио</a></li>
                                <li><a href="/prices.html">Цены</a></li>
                                <li><a href="/contacts.html">Контакты</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h3 class="footer-title">Услуги</h3>
                            <ul class="footer-links-list">
                                <li><a href="/services.html">Дизайн-проект</a></li>
                                <li><a href="/services.html">3D-визуализация</a></li>
                                <li><a href="/services.html">Декорирование</a></li>
                                <li><a href="/services.html">Консультация</a></li>
                                <li><a href="/services.html">Авторский надзор</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h3 class="footer-title">Контакты</h3>
                            <ul class="footer-contact-list">
                                <li><span class="contact-label">Телефон:</span><a href="tel:+79991234567" class="contact-value">+7 (999) 123-45-67</a></li>
                                <li><span class="contact-label">Email:</span><a href="mailto:info@interiorstudio.ru" class="contact-value">info@interiorstudio.ru</a></li>
                                <li><span class="contact-label">Адрес:</span><span class="contact-value">г. Москва, ул. Дизайнеров, 15</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="container">
                    <p>© 2026 InteriorStudio. Все права защищены.</p>
                </div>
            </div>
        </footer>
    `;
    
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

function updateHeaderForLoggedInUser(user) {
    const headerActions = document.getElementById('headerActions');
    if (!headerActions) return;
    
    const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : '?';
    const displayName = truncateName(user.name, 5);
    
    headerActions.innerHTML = `
        <a href="/cabinet.html" class="btn btn-outline btn-user" title="${user.name}">
            <span class="user-avatar">${firstLetter}</span>
            <span class="user-name-display">${displayName}</span>
        </a>
        <button onclick="logout()" class="btn btn-outline">Выйти</button>
    `;
}

function updateHeaderForGuest() {
    const headerActions = document.getElementById('headerActions');
    if (!headerActions) return;
    
    headerActions.innerHTML = `
        <a href="/request.html" class="btn btn-primary">Оставить заявку</a>
        <a href="/login.html" class="btn btn-outline">Войти</a>
    `;
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
        console.error('Ошибка выхода:', error);
    }
    window.location.href = '/index.html';
}

function initBurgerMenu() {
    const burgerMenu = document.getElementById('burgerMenu');
    const nav = document.getElementById('mainNav');
    
    if (burgerMenu && nav) {
        burgerMenu.addEventListener('click', function() {
            nav.classList.toggle('active');
            if (nav.classList.contains('active')) {
                nav.style.display = 'block';
            } else {
                nav.style.display = 'none';
            }
        });
    }
}