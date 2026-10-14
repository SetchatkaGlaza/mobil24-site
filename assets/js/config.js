/**
 * config.js — единственное место для настроек сайта.
 * Меняйте контакты, ссылки, ID Яндекс.Метрики и включайте видео здесь.
 * Файл подключается ДО data.js и main.js.
 */
window.SITE_CONFIG = {
  phone: '+7 964 666-44-66',          // как показываем на сайте
  phoneRaw: '+79646664466',            // для ссылки tel:
  telegram: 'https://t.me/mobil24auto',
  vk: 'https://vk.ru/club240904865',
  mapUrl: 'https://yandex.ru/maps/org/mobil_24_moyka/238192697405/',
  reviewsUrl: 'https://yandex.ru/maps/org/mobil_24_moyka/238192697405/reviews/',
  // Карта подгружается только по клику (быстрее сайт, меньше трекинга)
  mapEmbed: 'https://yandex.ru/map-widget/v1/?ll=39.816320%2C59.204197&z=17&pt=39.816320%2C59.204197%2Cpm2rdm',
  address: 'Вологда, Окружное шоссе, 9',
  rating: { value: '5,0', ratings: 26, reviews: 23 },

  // Номер счётчика Яндекс.Метрики, например 12345678. null = аналитика выключена.
  metrikaId: null,

  // Видео (необязательно): hero = фон главного экрана.
  // Положите файлы в assets/video/<имя>.mp4 (+ .webm) и поставьте true.
  // Пока false — показывается фото-заставка. См. docs/VIDEO-PROMPTS.md
  videos: { hero: false }
};
