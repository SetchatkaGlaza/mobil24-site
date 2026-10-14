# Промпты для видео (генерация из фото)

На сайте один видео-слот: `hero` (фон главного экрана на ПК). Это необязательно: пока видео нет, показываются фото.
Правила: исходное фото как первый кадр, 1080p, 24 fps, без звука, 6–8 секунд. Делайте 3–4 варианта и берите самый спокойный. Бракуйте ролики с «плывущими» буквами и лишними деталями. Файл: `assets/video/hero.mp4` (H.264, до 3–4 МБ), плюс `.webm`. Затем включите в `assets/js/config.js` → `videos`.

## 1. hero (фото `assets/img/hero-night.webp`, 16:9, 8 с)
```
Realistic handheld-quality footage of a dark modern self-service car wash building at night, shot on a smartphone from the opposite side of the lot. The white illuminated sign above the roller doors glows steadily. A very slow, almost imperceptible push-in, like a person slowly walking forward. Reflective yellow-black bollards catch the light. A thin low layer of mist drifts over the wet asphalt, nothing else moves. Natural film grain, real night exposure with soft bloom around the sign. Keep every letter of the sign and all doors, bricks and bollards exactly as in the source image. No people, no cars, no flicker, no camera shake.
Negative: morphing text, warped letters, extra windows, floating objects, oversharpened, CGI look, fisheye.
```
