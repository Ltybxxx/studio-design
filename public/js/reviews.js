document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('reviewForm');

    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('reviewName').value.trim();
            const text = document.getElementById('reviewText').value.trim();
            const ratingInputs = document.querySelectorAll('input[name="rating"]');
            let rating = null;

            ratingInputs.forEach(function(input) {
                if (input.checked) {
                    rating = input.value;
                }
            });

            if (!name) {
                alert('Пожалуйста, укажите ваше имя.');
                return;
            }

            if (!rating) {
                alert('Пожалуйста, поставьте оценку.');
                return;
            }

            if (!text) {
                alert('Пожалуйста, напишите отзыв.');
                return;
            }

            console.log('Отзыв готов к отправке:', { name, rating, text });

            alert('Спасибо за отзыв! Он будет опубликован после модерации.');
            reviewForm.reset();
        });
    }
});