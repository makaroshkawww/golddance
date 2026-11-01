const translations = {
    ru: {
        "Главная": "Главная", "Стили танца": "Стили танца", "Преподаватели": "Преподаватели", "События": "События", "О нас": "О нас",
        "Язык": "Язык", "Оплата": "Оплата", "Банковская карта": "Банковская карта", "СБП": "СБП", "Наличные": "Наличные",
        "Вход": "Вход", "Войти": "Войти", "Логин (Email)": "Логин (Email)", "Пароль": "Пароль", "Хочу зарегистрироваться": "Хочу зарегистрироваться",
        "Регистрация": "Регистрация", "ФИО": "ФИО", "Email": "Email", "Номер телефона": "Номер телефона", "Повторите пароль": "Повторите пароль", "Зарегистрироваться": "Зарегистрироваться", "Уже есть аккаунт": "Уже есть аккаунт",
        "МОЙ ПРОФИЛЬ": "МОЙ ПРОФИЛЬ", "Абонемент": "Абонемент", "Посещения": "Посещения", "Покупки": "Покупки", "Записи": "Записи",
        "Действующий абонемент": "Действующий абонемент", "У вас пока нет активных абонементов.": "У вас пока нет активных абонементов.",
        "История посещений": "История посещений", "Вы еще не посетили ни одного занятия.": "Вы еще не посетили ни одного занятия.",
        "Мои покупки": "Мои покупки", "История покупок пуста.": "История покупок пуста.",
        "Мои записи на занятия": "Мои записи на занятия", "У вас нет активных записей.": "У вас нет активных записей.",
        "Выйти из аккаунта": "Выйти из аккаунта", "Навигация": "Навигация", "Мы в соцсетях": "Мы в соцсетях"
    },
    en: {
        "Главная": "Home", "Стили танца": "Dance Styles", "Преподаватели": "Teachers", "События": "Events", "О нас": "About Us",
        "Язык": "Language", "Оплата": "Payment", "Банковская карта": "Bank Card", "СБП": "SBP", "Наличные": "Cash",
        "Вход": "Login", "Войти": "Sign In", "Логин (Email)": "Login (Email)", "Пароль": "Password", "Хочу зарегистрироваться": "I want to register",
        "Регистрация": "Registration", "ФИО": "Full Name", "Email": "Email", "Номер телефона": "Phone Number", "Повторите пароль": "Repeat Password", "Зарегистрироваться": "Sign Up", "Уже есть аккаунт": "Already have an account",
        "МОЙ ПРОФИЛЬ": "MY PROFILE", "Абонемент": "Subscription", "Посещения": "Visits", "Покупки": "Purchases", "Записи": "Records",
        "Действующий абонемент": "Active Subscription", "У вас пока нет активных абонементов.": "You don't have active subscriptions yet.",
        "История посещений": "Visit History", "Вы еще не посетили ни одного занятия.": "You haven't attended any classes yet.",
        "Мои покупки": "My Purchases", "История покупок пуста.": "Purchase history is empty.",
        "Мои записи на занятия": "My Class Records", "У вас нет активных записей.": "You have no active records.",
        "Выйти из аккаунта": "Log Out", "Навигация": "Navigation", "Мы в соцсетях": "Our Socials"
    }
};

function changeLanguage() {
    const lang = document.getElementById('langSelect').value;
    localStorage.setItem('userLang', lang);

    // Переводим все тексты
    document.querySelectorAll('a, button, h1, h2, h3, p, li, span, option, .menu-link, .submit-btn, .menu-btn').forEach(element => {
        const text = element.textContent.trim();
        if (translations[lang] && translations[lang][text]) {
            element.textContent = translations[lang][text];
        }
    });

    // Переводим плейсхолдеры в полях ввода
    document.querySelectorAll('input').forEach(input => {
        const placeholder = input.getAttribute('placeholder');
        if (placeholder && translations[lang] && translations[lang][placeholder]) {
            input.setAttribute('placeholder', translations[lang][placeholder]);
        }
    });

    document.documentElement.lang = lang;

    // Красивое уведомление вместо alert
    showNotification(lang === 'en' ? 'Language changed to English!' : 'Язык изменен на Русский!');
}

function showNotification(message) {
    const oldNotification = document.getElementById('lang-notification');
    if (oldNotification) oldNotification.remove();

    const notification = document.createElement('div');
    notification.id = 'lang-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background-color: #222; color: #FCC402; padding: 15px 30px;
        border-radius: 10px; font-family: 'Montserrat', sans-serif;
        font-weight: bold; font-size: 16px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        z-index: 10000; border: 1px solid #FCC402; transition: opacity 0.5s;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 2500);
}

// Загружаем сохраненный язык
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('userLang');
    if (savedLang && savedLang !== 'ru') {
        const select = document.getElementById('langSelect');
        if (select) {
            select.value = savedLang;
            changeLanguage();
        }
    }
});