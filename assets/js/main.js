/**
 * main.js — поведение сайта МОБИЛ24 (v7).
 * Без библиотек и сборки. Данные берутся из config.js и data.js.
 * Разделы: 0 утилиты · 1 контакты · 2 hero · 3 цены · 4 терминал · 5 боксы · 6 галерея
 *          7 отзывы · 8 видео · 9 интерфейс (шапка, появление, плавная прокрутка) · 10 аналитика
 */
(function () {
  'use strict';
  var C = window.SITE_CONFIG, S = window.SERVICES, $ = function (s, r) { return (r || document).querySelector(s); },
      $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); },
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* 0. УТИЛИТЫ */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function star() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z"/></svg>'; }
  function stars(n) { return new Array(n + 1).join(star()); }
  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function byId(id) { for (var i = 0; i < S.length; i++) if (S[i].id === id) return i; return 0; }

  /* 1. КОНТАКТНЫЕ ССЫЛКИ: data-cfg="tel|tg|vk|map|reviews" подставляется из config.js */
  var links = { tel: ['tel:' + C.phoneRaw, C.phone], tg: [C.telegram], vk: [C.vk], map: [C.mapUrl], reviews: [C.reviewsUrl] };
  $$('[data-cfg]').forEach(function (a) {
    var l = links[a.dataset.cfg]; if (!l) return; a.href = l[0];
    if (l[1] && !a.textContent.trim()) a.textContent = a.classList.contains('btn') ? 'Позвонить ' + l[1] : l[1];
  });
  $$('[data-stars]').forEach(function (e) { e.innerHTML = stars(+e.dataset.stars); e.setAttribute('role', 'img'); e.setAttribute('aria-label', 'Оценка ' + e.dataset.stars + ' из 5'); });

  /* 2. HERO: время в Вологде, табло цен (десктоп), лёгкий параллакс фона от курсора */
  function clock() {
    try { var t = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' }).format(new Date()); $('#liveT').textContent = 'Сейчас в Вологде ' + t + '. Мойка работает'; } catch (e) {}
  }
  clock(); setInterval(clock, 20000);
  var board = $('#boardRows'); board.innerHTML = S.map(function (s) { return '<div class="brow"><span>' + esc(s.title) + '</span><b>' + (s.price ? s.price + ' ₽' : '0 ₽') + '</b></div>'; }).join('');
  var brows = $$('.brow', board), bi = 0; function bstep() { brows.forEach(function (r, k) { r.classList.toggle('on', k === bi); }); bi = (bi + 1) % brows.length; }
  bstep(); if (!reduce) setInterval(bstep, 1300);
  if (fine && !reduce) $('#top').addEventListener('pointermove', function (e) { var h = this; h.style.setProperty('--mx', (e.clientX / innerWidth - .5) * 2); h.style.setProperty('--my', (e.clientY / innerHeight - .5) * 2); });

  /* 3. ЦЕНЫ: строки со шкалой + большое фото режима, автопереключение раз в 6 секунд */
  var list = $('#pickList'), view = $('#pickView'), cur = 0, timer = null, paused = false, maxP = Math.max.apply(null, S.map(function (s) { return s.price; }));
  list.innerHTML = S.map(function (s, i) { var w = Math.max(3, Math.round(s.price / maxP * 100));
    return '<button class="pr" role="tab" data-i="' + i + '"><span>' + esc(s.title) + '</span><b class="pr__v">' + (s.price ? s.price + ' ₽' : 'бесплатно') + '</b><i class="pr__bar"><u style="--w:' + w + '%"></u></i></button>'; }).join('');
  view.innerHTML = S.map(function (s, k) { return '<img ' + (k ? 'loading="lazy" ' : '') + 'src="' + s.img + '" alt="' + esc(s.title) + '">'; }).join('') +
    '<div class="pick__info"><span class="pick__price" id="pkPrice"></span><h3 id="pkT"></h3><p id="pkP"></p></div><div class="pick__bar"><i id="pkBar"></i></div>';
  var btns = $$('.pr', list), imgs = $$('img', view), bar = $('#pkBar');
  function select(n) {
    cur = (n + S.length) % S.length; var s = S[cur];
    btns.forEach(function (b, k) { b.setAttribute('aria-selected', k === cur); }); imgs.forEach(function (m, k) { m.classList.toggle('on', k === cur); });
    var pr = $('#pkPrice'); pr.innerHTML = s.price ? s.price + ' ₽<small>за минуту</small>' : 'Бесплатно'; pr.classList.toggle('pick__price--free', !s.price);
    $('#pkT').textContent = s.title; $('#pkP').textContent = s.text + (s.badge && s.price ? ' ' + s.badge + '.' : '');
    bar.classList.remove('run'); void bar.offsetWidth; if (!paused && !reduce) bar.classList.add('run');
    clearTimeout(timer); if (!paused && !reduce) timer = setTimeout(function () { select(cur + 1); }, 6000);
  }
  list.addEventListener('click', function (e) { var b = e.target.closest('.pr'); if (b) select(+b.dataset.i); });
  [list, view].forEach(function (el) {
    el.addEventListener('mouseenter', function () { paused = true; clearTimeout(timer); bar.classList.remove('run'); });
    el.addEventListener('mouseleave', function () { paused = false; select(cur); });
  });
  select(0);

  /* 4. ТЕРМИНАЛ: демонстрация (оплата, выбор режима ручкой, мойка, пауза). Суммы и время условные */
  var ST = [{ t: 2400, k: 'pay' }, { t: 3200, id: 'pressure', min: 3 }, { t: 2600, id: 'foam', min: 2 }, { t: 2200, id: 'wax', min: 1 }, { t: 2200, id: 'osmos', min: 1 }, { t: 3000, k: 'end' }],
      PAY = 500, base = [0, PAY], total = 0, cyc = 0;
  ST.forEach(function (s, i) { if (s.id) { s.cost = s.min * S[byId(s.id)].price; base[i + 1] = base[i] - s.cost; } cyc += s.t; });
  var left = base[ST.length - 1], tBal = $('#tBal'), tMode = $('#tMode'), tState = $('#tState'), knob = $('#knobR'), steps = $$('#steps li'), last = {};
  $('#tLeds').innerHTML = S.map(function () { return '<i class="led"></i>'; }).join(''); var leds = $$('.led');
  function setStep(n) { if (last.step === n) return; last.step = n; steps.forEach(function (li, i) { li.classList.toggle('on', i === n); }); }
  function render(t) {
    var acc = 0, k = 0; while (k < ST.length - 1 && t >= acc + ST[k].t) { acc += ST[k].t; k++; } var st = ST[k], p = Math.min(1, (t - acc) / st.t), bal, idx = -1, txt, state, ang = -120, step;
    if (st.k === 'pay') { bal = PAY * ease(p); txt = 'Оплата: карта, СБП, QR'; state = 'ОПЛАТА'; step = 0; }
    else if (st.k === 'end') { bal = left; idx = byId('air'); txt = 'Сжатый воздух · бесплатно'; state = 'ПАУЗА'; ang = -120 + idx * 30; step = 3; }
    else { idx = byId(st.id); bal = base[k] - st.cost * ease(p); txt = S[idx].title + ' · ' + S[idx].price + ' ₽/мин'; state = 'МОЙКА'; ang = -120 + idx * 30; step = (k === 1 && p < .3) ? 1 : 2; }
    var b = Math.round(bal) + ' ₽'; if (b !== last.bal) { tBal.textContent = b; last.bal = b; }
    if (txt !== last.txt) { tMode.textContent = txt; tState.textContent = state; last.txt = txt; }
    if (idx !== last.idx) { leds.forEach(function (l, i) { l.classList.toggle('on', i === idx); }); knob.style.transform = 'rotate(' + ang + 'deg)'; last.idx = idx; }
    setStep(step);
  }
  var tStart = 0, tRun = false;
  function tLoop(now) { if (!tRun) return; if (!tStart) tStart = now; render((now - tStart) % cyc); requestAnimationFrame(tLoop); }
  if (reduce) { render(ST[0].t + 3000); } else {
    render(0); new IntersectionObserver(function (en) { var v = en[0].isIntersecting; if (v && !tRun) { tRun = true; tStart = 0; requestAnimationFrame(tLoop); } else if (!v) tRun = false; }, { threshold: .25 }).observe($('.term'));
  }

  /* 5. БОКСЫ: схема 7 дверей, карточки подсвечивают свои двери (1 и 7 высокие) */
  var plan = $('#plan'); plan.innerHTML = [1, 2, 3, 4, 5, 6, 7].map(function (n, i) { var t = n === 1 || n === 7; return '<div class="pl ' + (t ? 'pl--t' : 'pl--s') + '" style="--i:' + i + '">' + n + '</div>'; }).join('');
  $$('.bay').forEach(function (b) { var c = 'hl-' + b.dataset.hl; ['mouseenter', 'focusin'].forEach(function (ev) { b.addEventListener(ev, function () { plan.classList.add(c); }); }); ['mouseleave', 'focusout'].forEach(function (ev) { b.addEventListener(ev, function () { plan.classList.remove(c); }); }); });

  /* 6. ГАЛЕРЕЯ: мозаика из 7 фото + просмотр всех 14 на весь экран (стрелки, свайп, Esc) */
  var G = window.GALLERY, lb = $('#lb'), lbImg = $('img', lb), gi = 0, shown = false;
  function url(k) { return 'assets/img/' + G[k][0] + '.webp'; }
  $('#mos').innerHTML = G.slice(0, 7).map(function (g, k) { var more = k === 6;
    return '<button class="tile' + (more ? ' tile--more' : '') + '" data-i="' + k + '" style="--i:' + k + '" aria-label="Открыть фото: ' + esc(g[1]) + '"><img loading="lazy" src="' + url(k) + '" alt="' + esc(g[1]) + '"><span>' + (more ? '+' + (G.length - 7) + '<small>ещё фото</small>' : esc(g[1])) + '</span></button>'; }).join('');
  function paint() { $('#lbC').textContent = ('0' + (gi + 1)).slice(-2) + ' / ' + ('0' + G.length).slice(-2); $('#lbCap').textContent = G[gi][1]; lbImg.alt = G[gi][1]; }
  function openLb(n) {
    var first = !lb.classList.contains('open'); gi = (n + G.length) % G.length;
    if (first) { lbImg.src = url(gi); paint(); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
    else { lbImg.classList.add('swap'); setTimeout(function () { lbImg.onload = function () { lbImg.classList.remove('swap'); }; lbImg.src = url(gi); paint(); }, 200); }
  }
  function closeLb() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  $('#mos').addEventListener('click', function (e) { var b = e.target.closest('.tile'); if (b) openLb(+b.dataset.i); });
  $('.lb__x').onclick = closeLb; $('.lb__p').onclick = function () { openLb(gi - 1); }; $('.lb__n').onclick = function () { openLb(gi + 1); };
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') openLb(gi - 1); if (e.key === 'ArrowRight') openLb(gi + 1); });
  var tx = 0; lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { var d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) openLb(gi + (d < 0 ? 1 : -1)); });

  /* 7. ОТЗЫВЫ: бегущая строка карточек с цветной верхней линией */
  var TINT = ['cA', 'cB', 'cC', 'cD', 'cE'];
  var cards = window.REVIEWS.map(function (r, k) {
    return '<article class="rv ' + TINT[k % 5] + '"><div class="rv__h"><span class="av">' + esc(r.name.charAt(0)) + '</span><div><b>' + esc(r.name) + '</b><small>Знаток города, ' + r.lvl + ' ур.</small></div></div>' +
      '<div class="stars" role="img" aria-label="Оценка 5 из 5">' + stars(5) + '</div><p>' + esc(r.text) + '</p><div class="rv__f">' + esc(r.date) + ' · Яндекс Карты</div></article>'; }).join('');
  $('#rows').innerHTML = '<div class="row">' + cards + cards + '</div>';

  /* 8. ВИДЕО-СЛОТ hero: если в config.js videos.hero = true, поверх фото ложится <video> */
  $$('[data-video]').forEach(function (el) {
    var name = el.dataset.video; if (!C.videos[name] || reduce) return;
    var v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none'; v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
    v.innerHTML = '<source src="assets/video/' + name + '.webm" type="video/webm"><source src="assets/video/' + name + '.mp4" type="video/mp4">'; el.appendChild(v);
    new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) v.play().catch(function () {}); else v.pause(); }); }).observe(el);
  });

  /* 9. ИНТЕРФЕЙС */
  var burger = $('#burger'), nav = $('#nav'), hd = $('#hd'), dock = $('#dock'), lastY = 0, tick = false;
  function toggleMenu(o) { nav.classList.toggle('is-open', o); hd.classList.toggle('is-open', o); burger.setAttribute('aria-expanded', o); }
  burger.onclick = function () { toggleMenu(!nav.classList.contains('is-open')); };
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') toggleMenu(false); });
  function onScroll() { var y = scrollY; hd.classList.toggle('is-solid', y > 20); hd.classList.toggle('is-hidden', y > lastY && y > 300 && !nav.classList.contains('is-open')); lastY = y;
    var on = y > innerHeight * .7; dock.classList.toggle('on', on); document.body.classList.toggle('has-dock', on); tick = false; }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true }); onScroll();
  // Появление блоков при прокрутке (заголовки и подводки тоже)
  $$('.sec h2, .sec > .w > .lead').forEach(function (e) { e.setAttribute('data-reveal', ''); });
  var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } }); }, { threshold: .12 });
  $$('[data-reveal], #mos').forEach(function (e, k) { if (!e.dataset.reveal || e.dataset.reveal === '') e.style.transitionDelay = (k % 3) * 80 + 'ms'; io.observe(e); });
  $('#mapBtn').onclick = function () { var f = document.createElement('iframe'); f.src = C.mapEmbed; f.title = 'Карта: ' + C.address; f.loading = 'lazy'; $('#map').innerHTML = ''; $('#map').appendChild(f); };
  // Плавная (инерционная) прокрутка колёсиком и по якорям: только на ПК с мышью; на телефонах работает родная
  if (fine && !reduce) {
    var target = scrollY, pos = scrollY, raf = 0, de = document.documentElement; de.classList.add('smooth');
    var maxY = function () { return de.scrollHeight - innerHeight; };
    var run = function () { pos += (target - pos) * .1; if (Math.abs(target - pos) < .5) pos = target; window.scrollTo(0, pos); raf = pos !== target ? requestAnimationFrame(run) : 0; };
    var go = function (y) { target = Math.max(0, Math.min(maxY(), y)); if (!raf) { pos = scrollY; raf = requestAnimationFrame(run); } };
    addEventListener('wheel', function (e) { if (e.ctrlKey || lb.classList.contains('open') || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; e.preventDefault(); go(target + e.deltaY * (e.deltaMode === 1 ? 32 : 1)); }, { passive: false });
    addEventListener('scroll', function () { if (!raf) { target = pos = scrollY; } }, { passive: true });
    document.addEventListener('click', function (e) { var a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href').length < 2) return; var el = document.getElementById(a.getAttribute('href').slice(1)); if (el) { e.preventDefault(); go(el.getBoundingClientRect().top + scrollY - 70); } });
  }

  /* 10. ЯНДЕКС.МЕТРИКА и цели: data-goal="call|route|telegram|vk|reviews" */
  if (C.metrikaId) {
    (function (m, e, t, r, i, k, a) { m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date(); k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a); })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(C.metrikaId, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  }
  document.addEventListener('click', function (e) { var a = e.target.closest('[data-goal]'); if (a && C.metrikaId && window.ym) window.ym(C.metrikaId, 'reachGoal', a.dataset.goal); });
})();
