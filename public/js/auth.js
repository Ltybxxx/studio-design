class Auth {
    constructor() {
        this.currentUser = null;
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/check-auth');
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
            }
            
            return this.currentUser;
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            return null;
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    async login(email, password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
            }
            
            return data;
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { success: false, message: 'Ошибка соединения с сервером.' };
        }
    }

    async register(name, email, phone, password) {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
            }
            
            return data;
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return { success: false, message: 'Ошибка соединения с сервером.' };
        }
    }

    async logout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
        
        this.currentUser = null;
        window.location.href = 'index.html';
    }

    async updateProfile(name, email, phone) {
        try {
            const response = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
            }
            
            return data;
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            return { success: false, message: 'Ошибка соединения с сервером.' };
        }
    }

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

const auth = new Auth();