const express = require('express');
const session = require('express-session');
const path = require('path');
const database = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(session({
    secret: 'interior-studio-secret-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 }
}));

app.use(express.static(path.join(__dirname, '..', 'public')));

database.initDatabase().then(() => {
    console.log('========================================');
    console.log('Сервер запущен: http://localhost:' + PORT);
    console.log('Админ-панель: http://localhost:' + PORT + '/admin/index.html');
    console.log('Админ: admin@interiorstudio.ru / admin123');
    console.log('Пользователь: test@test.ru / test123');
    console.log('========================================');
}).catch(err => {
    console.error('Ошибка инициализации:', err);
});

function isAdmin(req) {
    return req.session.userId && req.session.userRole === 'admin';
}

// ============ AUTH ============

app.post('/api/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.json({ success: false, message: 'Заполните все поля.' });
    const existingUser = database.findByEmail(email);
    if (existingUser) return res.json({ success: false, message: 'Пользователь уже существует.' });
    const user = database.insertUser(name, email, phone || '', password, 'user');
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userRole = user.role;
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false, message: 'Заполните все поля.' });
    const user = database.findByEmail(email);
    if (!user) return res.json({ success: false, message: 'Пользователь не найден.' });
    if (user.password !== password) return res.json({ success: false, message: 'Неверный пароль.' });
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userRole = user.role;
    req.session.userNickname = user.role === 'admin' ? 'Админ' : user.name;
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, nickname: user.role === 'admin' ? 'Админ' : user.name } });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ success: true, user: { id: req.session.userId, name: req.session.userName, role: req.session.userRole, nickname: req.session.userNickname || req.session.userName } });
    } else {
        res.json({ success: false });
    }
});

// ============ USER ============

app.get('/api/user', (req, res) => {
    if (!req.session.userId) return res.json({ success: false, message: 'Не авторизован.' });
    const user = database.getById('users', req.session.userId);
    if (!user) return res.json({ success: false, message: 'Пользователь не найден.' });
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
});

app.put('/api/user', (req, res) => {
    if (!req.session.userId) return res.json({ success: false, message: 'Не авторизован.' });
    const { name, email, phone } = req.body;
    const user = database.updateUser(req.session.userId, name, email, phone || '');
    req.session.userName = name;
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
});

// ============ REQUESTS ============

app.get('/api/requests', (req, res) => {
    if (!req.session.userId) return res.json({ success: false, requests: [] });
    const requests = isAdmin(req) ? database.getAllRequests() : database.getRequestsByUser(req.session.userId);
    res.json({ success: true, requests });
});

app.get('/api/requests/:id', (req, res) => {
    if (!req.session.userId) return res.json({ success: false, message: 'Не авторизован.' });
    const request = database.getRequestById(parseInt(req.params.id));
    if (!request) return res.json({ success: false, message: 'Заявка не найдена.' });
    if (request.user_id !== req.session.userId && !isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    res.json({ success: true, request });
});

app.delete('/api/requests/:id', (req, res) => {
    if (!req.session.userId) return res.json({ success: false, message: 'Не авторизован.' });
    const request = database.getRequestById(parseInt(req.params.id));
    if (!request) return res.json({ success: false, message: 'Заявка не найдена.' });
    if (request.user_id !== req.session.userId && !isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    database.deleteRequest(req.params.id);
    res.json({ success: true });
});

app.post('/api/requests', (req, res) => {
    const { name, phone, email, roomType, area, serviceType, budget, comment } = req.body;
    if (!name || !phone) return res.json({ success: false, message: 'Имя и телефон обязательны.' });
    database.insertRequest({
        user_id: req.session.userId || null, name, phone,
        email: email || '', room_type: roomType || '', area: area || null,
        service_type: serviceType || '', budget: budget || '', comment: comment || ''
    });
    res.json({ success: true });
});

app.put('/api/requests/:id/status', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    database.updateRequestStatus(req.params.id, req.body.status);
    res.json({ success: true });
});

// ============ SERVICES ============

app.get('/api/services', (req, res) => res.json({ success: true, services: database.getAll('services') }));
app.post('/api/services', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    const { title, description, price_from, image_url } = req.body;
    if (!title) return res.json({ success: false, message: 'Название обязательно.' });
    database.insertService(title, description || '', price_from || 0, image_url || '');
    res.json({ success: true });
});
app.put('/api/services/:id', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    const { title, description, price_from, image_url } = req.body;
    database.updateService(req.params.id, title, description || '', price_from || 0, image_url || '');
    res.json({ success: true });
});
app.delete('/api/services/:id', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    database.deleteService(req.params.id);
    res.json({ success: true });
});

// ============ PROJECTS ============

app.get('/api/projects', (req, res) => res.json({ success: true, projects: database.getAll('projects') }));
app.get('/api/projects/:id', (req, res) => {
    const project = database.getById('projects', parseInt(req.params.id));
    if (project) res.json({ success: true, project });
    else res.json({ success: false, message: 'Проект не найден.' });
});
app.post('/api/projects', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    const { title, room_type, area, style, year_completed, description, image_url, client_task, solution, work_done } = req.body;
    if (!title) return res.json({ success: false, message: 'Название обязательно.' });
    database.insertProject({
        title, room_type: room_type || '', area: area || 0, style: style || '',
        year_completed: year_completed || new Date().getFullYear(),
        description: description || '', image_url: image_url || '',
        gallery: JSON.stringify([image_url || '']),
        client_task: client_task || '', solution: solution || '', work_done: work_done || ''
    });
    res.json({ success: true });
});
app.put('/api/projects/:id', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    const { title, room_type, area, style, year_completed, description, image_url, client_task, solution, work_done } = req.body;
    database.updateProject(req.params.id, {
        title, room_type: room_type || '', area: area || 0, style: style || '',
        year_completed: year_completed || new Date().getFullYear(),
        description: description || '', image_url: image_url || '',
        gallery: JSON.stringify([image_url || '']),
        client_task: client_task || '', solution: solution || '', work_done: work_done || ''
    });
    res.json({ success: true });
});
app.delete('/api/projects/:id', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    database.deleteProject(req.params.id);
    res.json({ success: true });
});

// ============ REVIEWS ============

app.get('/api/reviews', (req, res) => {
    const reviews = database.getAll('reviews').filter(r => r.is_published === 1);
    res.json({ success: true, reviews });
});

app.get('/api/reviews/all', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    res.json({ success: true, reviews: database.getAll('reviews') });
});

app.post('/api/reviews', (req, res) => {
    try {
        const { authorName, rating, text, photoBase64 } = req.body;
        if (!authorName || !text) return res.json({ success: false, message: 'Имя и отзыв обязательны.' });
        const result = database.insertReview(req.session.userId || null, authorName, rating || 5, text, photoBase64 || null);
        if (result.success) {
            res.json({ success: true, message: 'Отзыв отправлен на модерацию.' });
        } else {
            res.json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Ошибка создания отзыва:', error);
        res.json({ success: false, message: 'Ошибка сервера.' });
    }
});

app.put('/api/reviews/:id/approve', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    database.updateReviewStatus(req.params.id, 1);
    res.json({ success: true });
});

app.put('/api/reviews/:id/reject', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    database.updateReviewStatus(req.params.id, 0);
    res.json({ success: true });
});

app.delete('/api/reviews/:id', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    database.deleteReview(req.params.id);
    res.json({ success: true });
});

// ============ BLOG ============

app.get('/api/blog', (req, res) => {
    const posts = database.getAll('blog_posts').filter(p => p.is_published === 1);
    res.json({ success: true, posts });
});
app.get('/api/blog/all', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    res.json({ success: true, posts: database.getAll('blog_posts') });
});
app.post('/api/blog', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    const { title, content, image_url } = req.body;
    if (!title || !content) return res.json({ success: false, message: 'Заголовок и текст обязательны.' });
    database.insertBlogPost(title, content, image_url || '');
    res.json({ success: true });
});
app.put('/api/blog/:id', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    const { title, content, image_url } = req.body;
    database.updateBlogPost(req.params.id, title, content, image_url || '');
    res.json({ success: true });
});
app.delete('/api/blog/:id', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    database.deleteBlogPost(req.params.id);
    res.json({ success: true });
});

// ============ USERS ============

app.get('/api/users', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    const users = database.getAll('users').map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, is_blocked: u.is_blocked || 0, created_at: u.created_at }));
    res.json({ success: true, users });
});

app.put('/api/users/:id/block', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    database.blockUser(req.params.id);
    res.json({ success: true });
});

app.put('/api/users/:id/unblock', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    database.unblockUser(req.params.id);
    res.json({ success: true });
});

app.delete('/api/users/:id', (req, res) => {
    if (!isAdmin(req)) return res.json({ success: false, message: 'Нет доступа.' });
    database.deleteUser(req.params.id);
    res.json({ success: true });
});

// ============ FALLBACK ============

app.get('*', (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', req.path);
    res.sendFile(filePath, (err) => {
        if (err) res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    });
});

app.listen(PORT);