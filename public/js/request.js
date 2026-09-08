document.addEventListener('DOMContentLoaded', function() {
    const requestForm = document.getElementById('requestForm');

    if (requestForm) {
        requestForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const agreement = document.getElementById('agreement').checked;

            if (!name) {
                alert('Пожалуйста, укажите ваше имя.');
                return;
            }

            if (!phone) {
                alert('Пожалуйста, укажите номер телефона.');
                return;
            }

            if (!agreement) {
                alert('Необходимо дать согласие на обработку персональных данных.');
                return;
            }

            const formData = new FormData(requestForm);

            console.log('Данные формы готовы к отправке:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            alert('Спасибо! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.');
            requestForm.reset();
        });
    }

    const fileInput = document.getElementById('file');
    const filePlaceholder = document.querySelector('.file-placeholder');

    if (fileInput && filePlaceholder) {
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length > 0) {
                filePlaceholder.textContent = 'Выбран файл: ' + fileInput.files[0].name;
            } else {
                filePlaceholder.textContent = 'Перетащите файл сюда или нажмите для выбора';
            }
        });
    }
});