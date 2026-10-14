# Публикация сайта

**Перед любым вариантом** замените `https://YOUR-DOMAIN.ru` на настоящий адрес сайта в файлах `index.html`, `robots.txt`, `sitemap.xml`:
```bash
grep -rl "YOUR-DOMAIN.ru" . | xargs sed -i 's#https://YOUR-DOMAIN.ru#https://mobil24-vologda.ru#g'
```
## GitHub Pages (бесплатно)
1. Создайте репозиторий и загрузите проект: `git remote add origin <URL>` → `git push -u origin main`.
2. Settings → Pages → Source: Deploy from a branch → `main` / `(root)`.
3. Сайт будет по адресу `https://<логин>.github.io/<репозиторий>/`. Для своего домена укажите его в Pages и добавьте CNAME у регистратора.
(Если сайт открывается по подпути репозитория, ссылки в проекте относительные и работают без правок.)
## Netlify или Cloudflare Pages
Подключите репозиторий, команда сборки пустая, папка публикации: `/` (корень).
## Обычный хостинг (FTP, панель)
Загрузите всё содержимое проекта (кроме `.git`, `scripts`, `docs`) в папку сайта (`public_html` или `www`). Включите HTTPS и перенаправление на него.
## Nginx (свой сервер)
```nginx
server { server_name your-domain.ru; root /var/www/mobil24; index index.html;
  location ~* \.(webp|png|jpg|css|js|mp4|webm|woff2)$ { expires 30d; add_header Cache-Control "public"; } }
```
## После публикации
Добавьте сайт в Яндекс Вебмастер и Яндекс Бизнес (укажите сайт в карточке организации), отправьте `sitemap.xml`.
