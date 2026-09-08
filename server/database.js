const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_FILE = path.join(__dirname, '..', 'data', 'interior_studio.db');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

async function initDatabase() {
    if (db) return db;
    
    const SQL = await initSqlJs();
    
    if (fs.existsSync(DB_FILE)) {
        const fileBuffer = fs.readFileSync(DB_FILE);
        db = new SQL.Database(fileBuffer);
        console.log('База данных загружена');
    } else {
        db = new SQL.Database();
        createTables();
        insertDefaultData();
        saveDatabase();
        console.log('База данных создана');
    }
    
    return db;
}

function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT DEFAULT '',
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        is_blocked INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        room_type TEXT,
        area REAL,
        service_type TEXT,
        budget TEXT,
        comment TEXT,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        price_from REAL,
        image_url TEXT,
        is_active INTEGER DEFAULT 1
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        room_type TEXT,
        area REAL,
        style TEXT,
        year_completed INTEGER,
        description TEXT,
        image_url TEXT,
        gallery TEXT,
        client_task TEXT,
        solution TEXT,
        work_done TEXT,
        is_published INTEGER DEFAULT 1
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        author_name TEXT NOT NULL,
        rating INTEGER,
        text TEXT NOT NULL,
        photo_url TEXT,
        is_published INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        is_published INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

function insertDefaultData() {
    const userCount = db.exec('SELECT COUNT(*) as count FROM users')[0].values[0][0];
    if (userCount > 0) return;
    
    db.run(`INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`, 
        ['Администратор', 'admin@interiorstudio.ru', '', 'admin123', 'admin']);
    db.run(`INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`, 
        ['Тестовый Пользователь', 'test@test.ru', '+7 (999) 000-00-00', 'test123', 'user']);
    
    const services = [
        ['Дизайн-проект', 'Разработка полного дизайн-проекта квартиры, дома или коммерческого помещения', 3000, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'],
        ['3D-визуализация', 'Фотореалистичная визуализация интерьеров', 1500, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600'],
        ['Декорирование', 'Подбор мебели, освещения и декоративных элементов', 50000, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600'],
        ['Консультация', 'Профессиональная консультация по интерьерным решениям', 5000, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600'],
        ['Авторский надзор', 'Контроль за реализацией проекта', 30000, 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600'],
        ['Планировочное решение', 'Разработка оптимальной планировки помещения', 500, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600']
    ];
    
    const insertService = db.prepare('INSERT INTO services (title, description, price_from, image_url) VALUES (?, ?, ?, ?)');
    services.forEach(s => insertService.run(s));
    insertService.free();
    
    const projects = [
        {
            title: 'Квартира в стиле минимализм', room_type: 'Квартира', area: 65, style: 'Минимализм', year_completed: 2025,
            description: 'Современная квартира', image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
            gallery: JSON.stringify(['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800','https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800']),
            client_task: 'Клиенты обратились с запросом на создание минималистичного интерьера.', solution: 'Разработали дизайн-проект с акцентом на простые формы.', work_done: 'Планировка, визуализация, подбор мебели'
        },
        {
            title: 'Загородный дом', room_type: 'Дом', area: 120, style: 'Скандинавский', year_completed: 2025,
            description: 'Уютный загородный дом', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
            gallery: JSON.stringify(['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800','https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800']),
            client_task: 'Семья обратилась за дизайном загородного дома.', solution: 'Создали светлый интерьер в скандинавском стиле.', work_done: 'Планировка, визуализация, декорирование'
        },
        {
            title: 'Кафе в лофт-стиле', room_type: 'Коммерческое помещение', area: 80, style: 'Лофт', year_completed: 2024,
            description: 'Атмосферное кафе', image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
            gallery: JSON.stringify(['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800','https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800','https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800','https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800','https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800']),
            client_task: 'Владельцы хотели атмосферное место.', solution: 'Использовали кирпичные стены и тёплое освещение.', work_done: 'Дизайн-проект, визуализация, подбор мебели'
        },
        {
            title: 'Офис в современном стиле', room_type: 'Коммерческое помещение', area: 150, style: 'Современный', year_completed: 2024,
            description: 'Функциональный офис', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
            gallery: JSON.stringify(['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800','https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800','https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800']),
            client_task: 'IT-компания обратилась за дизайном офиса.', solution: 'Создали открытое пространство с зонами.', work_done: 'Планировка, дизайн-проект, визуализация'
        },
        {
            title: 'Квартира в классическом стиле', room_type: 'Квартира', area: 85, style: 'Классический', year_completed: 2023,
            description: 'Элегантная квартира', image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
            gallery: JSON.stringify(['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800','https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800']),
            client_task: 'Клиенты хотели элегантный интерьер.', solution: 'Использовали классические элементы.', work_done: 'Дизайн-проект, подбор мебели, декорирование'
        },
        {
            title: 'Студия в стиле лофт', room_type: 'Квартира', area: 45, style: 'Лофт', year_completed: 2023,
            description: 'Компактная студия', image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            gallery: JSON.stringify(['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800','https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800','https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800','https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=800','https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800']),
            client_task: 'Молодой человек обратился за дизайном студии.', solution: 'Создали функциональное пространство.', work_done: 'Планировка, дизайн-проект, визуализация'
        }
    ];
    
    const insertProject = db.prepare('INSERT INTO projects (title, room_type, area, style, year_completed, description, image_url, gallery, client_task, solution, work_done) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    projects.forEach(p => insertProject.run([p.title, p.room_type, p.area, p.style, p.year_completed, p.description, p.image_url, p.gallery, p.client_task, p.solution, p.work_done]));
    insertProject.free();
    
    const reviews = [
        ['Анна Петрова', 5, 'Очень довольны работой студии!', 1],
        ['Сергей Иванов', 5, 'Работа выполнена профессионально.', 1],
        ['Елена Смирнова', 4, 'Гости в восторге от интерьера.', 1]
    ];
    
    const insertReview = db.prepare('INSERT INTO reviews (author_name, rating, text, is_published) VALUES (?, ?, ?, ?)');
    reviews.forEach(r => insertReview.run(r));
    insertReview.free();
    
    const blogPosts = [
        { title: 'Тренды интерьерного дизайна в 2026 году', content: 'Экологичные материалы становятся главным трендом 2026 года. Дизайнеры всё чаще используют переработанные материалы, натуральное дерево, камень и текстиль из органических волокон.', image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600', is_published: 1, created_at: '2026-04-12T10:00:00Z' },
        { title: 'Как обустроить маленькую квартиру', content: 'Организация пространства в небольшой квартире требует продуманного подхода. Используйте многофункциональную мебель: диван-кровать, раскладной стол.', image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600', is_published: 1, created_at: '2026-04-05T10:00:00Z' },
        { title: 'Роль освещения в интерьере', content: 'Освещение играет ключевую роль в создании атмосферы. Используйте несколько уровней освещения.', image_url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600', is_published: 1, created_at: '2026-03-28T10:00:00Z' }
    ];
    
    const insertBlog = db.prepare('INSERT INTO blog_posts (title, content, image_url, is_published, created_at) VALUES (?, ?, ?, ?, ?)');
    blogPosts.forEach(bp => insertBlog.run([bp.title, bp.content, bp.image_url, bp.is_published, bp.created_at]));
    insertBlog.free();
}

function saveDatabase() {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
}

function getAll(table) {
    const stmt = db.prepare(`SELECT * FROM ${table}`);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
}

function getById(table, id) {
    const stmt = db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
    stmt.bind([id]);
    let result = null;
    if (stmt.step()) result = stmt.getAsObject();
    stmt.free();
    return result;
}

function findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    stmt.bind([email]);
    let result = null;
    if (stmt.step()) result = stmt.getAsObject();
    stmt.free();
    return result;
}

function insertUser(name, email, phone, password, role) {
    db.run('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)', [name, email, phone, password, role]);
    saveDatabase();
    return findByEmail(email);
}

function updateUser(id, name, email, phone) {
    db.run('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?', [name, email, phone, id]);
    saveDatabase();
    return getById('users', id);
}

function deleteUser(id) {
    db.run('DELETE FROM users WHERE id = ?', [id]);
    saveDatabase();
}

function blockUser(id) {
    db.run('UPDATE users SET is_blocked = 1 WHERE id = ?', [id]);
    saveDatabase();
}

function unblockUser(id) {
    db.run('UPDATE users SET is_blocked = 0 WHERE id = ?', [id]);
    saveDatabase();
}

function getRequestsByUser(userId) {
    const stmt = db.prepare('SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC');
    stmt.bind([userId]);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
}

function getAllRequests() {
    const stmt = db.prepare('SELECT * FROM requests ORDER BY created_at DESC');
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
}

function getRequestById(id) {
    return getById('requests', id);
}

function insertRequest(requestData) {
    db.run(`INSERT INTO requests (user_id, name, phone, email, room_type, area, service_type, budget, comment, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`, [
        requestData.user_id, requestData.name, requestData.phone, requestData.email,
        requestData.room_type, requestData.area, requestData.service_type, requestData.budget, requestData.comment
    ]);
    saveDatabase();
}

function deleteRequest(id) {
    db.run('DELETE FROM requests WHERE id = ?', [id]);
    saveDatabase();
}

function updateRequestStatus(id, status) {
    db.run('UPDATE requests SET status = ? WHERE id = ?', [status, id]);
    saveDatabase();
}

function insertService(title, description, price_from, image_url) {
    db.run('INSERT INTO services (title, description, price_from, image_url) VALUES (?, ?, ?, ?)', [title, description, price_from, image_url]);
    saveDatabase();
}

function updateService(id, title, description, price_from, image_url) {
    db.run('UPDATE services SET title = ?, description = ?, price_from = ?, image_url = ? WHERE id = ?', [title, description, price_from, image_url, id]);
    saveDatabase();
}

function deleteService(id) {
    db.run('DELETE FROM services WHERE id = ?', [id]);
    saveDatabase();
}

function insertProject(projectData) {
    db.run(`INSERT INTO projects (title, room_type, area, style, year_completed, description, image_url, gallery, client_task, solution, work_done) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        projectData.title, projectData.room_type, projectData.area, projectData.style,
        projectData.year_completed, projectData.description, projectData.image_url,
        projectData.gallery, projectData.client_task, projectData.solution, projectData.work_done
    ]);
    saveDatabase();
}

function updateProject(id, projectData) {
    db.run(`UPDATE projects SET title = ?, room_type = ?, area = ?, style = ?, year_completed = ?, description = ?, image_url = ?, gallery = ?, client_task = ?, solution = ?, work_done = ? WHERE id = ?`, [
        projectData.title, projectData.room_type, projectData.area, projectData.style,
        projectData.year_completed, projectData.description, projectData.image_url,
        projectData.gallery, projectData.client_task, projectData.solution, projectData.work_done, id
    ]);
    saveDatabase();
}

function deleteProject(id) {
    db.run('DELETE FROM projects WHERE id = ?', [id]);
    saveDatabase();
}

function insertReview(userId, authorName, rating, text, photoUrl) {
    try {
        db.run('INSERT INTO reviews (user_id, author_name, rating, text, photo_url, is_published) VALUES (?, ?, ?, ?, ?, 0)', 
            [userId || null, authorName, rating || 5, text, photoUrl || null]);
        saveDatabase();
        return { success: true };
    } catch (error) {
        console.error('Ошибка вставки отзыва:', error);
        return { success: false, message: error.message };
    }
}

function updateReviewStatus(id, isPublished) {
    db.run('UPDATE reviews SET is_published = ? WHERE id = ?', [isPublished, id]);
    saveDatabase();
}

function deleteReview(id) {
    db.run('DELETE FROM reviews WHERE id = ?', [id]);
    saveDatabase();
}

function insertBlogPost(title, content, image_url) {
    db.run('INSERT INTO blog_posts (title, content, image_url, is_published) VALUES (?, ?, ?, 1)', [title, content, image_url]);
    saveDatabase();
}

function updateBlogPost(id, title, content, image_url) {
    db.run('UPDATE blog_posts SET title = ?, content = ?, image_url = ? WHERE id = ?', [title, content, image_url, id]);
    saveDatabase();
}

function deleteBlogPost(id) {
    db.run('DELETE FROM blog_posts WHERE id = ?', [id]);
    saveDatabase();
}

module.exports = {
    initDatabase, getAll, getById, findByEmail,
    insertUser, updateUser, deleteUser, blockUser, unblockUser,
    getRequestsByUser, getAllRequests, getRequestById, insertRequest, deleteRequest, updateRequestStatus,
    insertService, updateService, deleteService,
    insertProject, updateProject, deleteProject,
    insertReview, updateReviewStatus, deleteReview,
    insertBlogPost, updateBlogPost, deleteBlogPost
};