#!/usr/bin/env python3
"""
Делает скриншоты сайта в docs/screenshots/ (десктоп и телефон).
Нужно: pip install playwright && playwright install chromium
Запуск из корня проекта: python3 scripts/screenshots.py
"""
import functools, http.server, os, threading, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'screenshots')
os.makedirs(OUT, exist_ok=True)

# Локальный сервер, чтобы сайт открывался как на хостинге
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
handler.log_message = lambda *a, **k: None
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{srv.server_address[1]}/index.html'

def goto(page, sel):
    page.evaluate(f"document.querySelector('{sel}').scrollIntoView()")
    time.sleep(1.4)  # ждём анимацию появления

with sync_playwright() as p:
    b = p.chromium.launch()
    for name, ctx in {
        'desktop': dict(viewport={'width': 1440, 'height': 900}),
        'mobile': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
    }.items():
        page = b.new_context(**ctx).new_page()
        page.goto(URL); time.sleep(1.2)
        page.screenshot(path=f'{OUT}/{name}-hero.jpg', type='jpeg', quality=80)
        for sec in ['services', 'how', 'bays', 'gallery', 'reviews', 'contacts']:
            goto(page, '#' + sec)
            page.screenshot(path=f'{OUT}/{name}-{sec}.jpg', type='jpeg', quality=80)
        h = page.evaluate('document.body.scrollHeight')
        for y in range(0, h, 500):
            page.evaluate(f'window.scrollTo(0,{y})'); time.sleep(.1)
        page.evaluate('window.scrollTo(0,0)'); time.sleep(.4)
        page.screenshot(path=f'{OUT}/{name}-full.jpg', type='jpeg', quality=80, full_page=True)
    b.close()
print('Готово:', OUT)
