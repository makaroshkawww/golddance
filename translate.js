// Словари переводов
const translations = {
    ru: {
        "Главная": "Главная",
        "Стили танца": "Стили танца",
        "Преподаватели": "Преподаватели",
        "События": "События",
        "О нас": "О нас",
        "ВКонтакте": "ВКонтакте",
        "Telegram": "Telegram",
        "WhatsApp": "WhatsApp",
        "Язык": "Язык",
        "Оплата": "Оплата",
        "Банковская карта": "Банковская карта",
        "СБП": "СБП",
        "Наличные": "Наличные"
    },
    en: {
        "Главная": "Home",
        "Стили танца": "Dance Styles",
        "Преподаватели": "Teachers",
        "События": "Events",
        "О нас": "About Us",
        "ВКонтакте": "VKontakte",
        "Telegram": "Telegram",
        "WhatsApp": "WhatsApp",
        "Язык": "Language",
        "Оплата": "Payment",
        "Банковская карта": "Bank Card",
        "СБП": "SBP",
        "Наличные": "Cash"
    }
};

// Функция перевода
function changeLanguage() {
    const lang = document.getElementById('langSelect').value;
    localStorage.setItem('userLang', lang);
    
    // Переводим все ссылки в меню (и в шапке, и в бургере)
    document.querySelectorAll('nav a, .menu-link').forEach(link => {
        const text = link.textContent.trim();
        if (translations[lang] && translations[lang][text]) {
            link.textContent = translations[lang][text];
        }
    });

    // Переводим заголовки в настройках
    document.querySelectorAll('.settings-dropdown h4, .menu-dropdown h4').forEach(h4 => {
        const text = h4.textContent.trim();
        // Убираем иконку из текста для проверки
        const cleanText = text.replace(/[^\w\sа-яА-ЯёЁ]/g, '').trim();
        if (translations[lang] && translations[lang][cleanText]) {
            // Находим иконку и оставляем её
            const icon = h4.querySelector('i');
            h4.innerHTML = (icon ? icon.outerHTML : '') + ' ' + translations[lang][cleanText];
        }
    });

    // Переводим опции в селектах
    document.querySelectorAll('select option').forEach(option => {
        const text = option.textContent.trim();
        if (translations[lang] && translations[lang][text]) {
            option.textContent = translations[lang][text];
        }
    });

    document.documentElement.lang = lang;
}

// Восстановление языка при загрузке
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