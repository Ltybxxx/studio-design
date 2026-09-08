document.addEventListener('DOMContentLoaded', function() {
    const contactsForm = document.getElementById('contactsForm');

    if (contactsForm) {
        contactsForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('contactName').value.trim();
            const phone = document.getElementById('contactPhone').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (!name) {
                alert('Пожалуйста, укажите ваше имя.');
                return;
            }

            if (!phone) {
                alert('Пожалуйста, укажите номер телефона.');
                return;
            }

            if (!message) {
                alert('Пожалуйста, напишите сообщение.');
                return;
            }

            console.log('Сообщение готово к отправке:', { name, phone, message });

            alert('Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.');
            contactsForm.reset();
        });
    }
});