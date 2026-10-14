"""
Проверка адаптива: 9 разрешений (320–1920 px). Для каждого: горизонтальная прокрутка, мелкий текст,
размер зон нажатия, чёткость фото (размер файла против экрана) и скриншоты разделов.
Запуск из корня проекта: python3 scripts/test-responsive.py
"""
import time,functools,http.server,threading,os,sys
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
h=functools.partial(http.server.SimpleHTTPRequestHandler,directory=ROOT);h.log_message=lambda *a,**k:None
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),h);threading.Thread(target=srv.serve_forever,daemon=True).start()
U=f'http://127.0.0.1:{srv.server_address[1]}/index.html'
sizes=[(320,640,2),(360,740,3),(390,844,3),(414,896,3),(768,1024,2),(1024,768,1),(1280,800,1),(1440,900,1),(1920,1080,1)]
out=os.path.join(ROOT,'docs','screenshots','responsive')+'/';os.makedirs(out,exist_ok=True)
CHK='''()=>{const r={};r.overflow=document.documentElement.scrollWidth-document.documentElement.clientWidth;
r.small=[...document.querySelectorAll('body *')].filter(e=>e.offsetParent&&e.children.length==0&&e.textContent.trim().length>1&&parseFloat(getComputedStyle(e).fontSize)<13.5).map(e=>e.textContent.trim().slice(0,18)+':'+getComputedStyle(e).fontSize).slice(0,5);
r.tap=[...document.querySelectorAll('a.btn,button.pk,button.door,.dock a,.nav a')].filter(e=>e.offsetParent&&(e.getBoundingClientRect().height<44)).map(e=>e.textContent.trim().slice(0,14)+':'+Math.round(e.getBoundingClientRect().height)).slice(0,5);
const dpr=devicePixelRatio;r.blur=[...document.querySelectorAll('img')].filter(i=>i.offsetParent&&i.complete&&i.naturalWidth).filter(i=>{const b=i.getBoundingClientRect();if(getComputedStyle(i).objectFit=='contain'){return Math.min(b.width/i.naturalWidth,b.height/i.naturalHeight)*Math.min(dpr,2)>1.15}return i.naturalWidth<b.width*Math.min(dpr,2)*0.85}).map(i=>i.src.split('/').pop()+' '+i.naturalWidth+'<'+Math.round(b2(i))).slice(0,5);function b2(i){return i.getBoundingClientRect().width*Math.min(dpr,2)}
return r}'''
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,hh,d in sizes:
        c=b.new_context(viewport={'width':w,'height':hh},device_scale_factor=d,is_mobile=w<800,has_touch=w<800);pg=c.new_page()
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(U);time.sleep(2)
        for sec in ['top','services','how','bays','gallery','reviews','contacts']:
            pg.evaluate(f"document.getElementById('{sec}').scrollIntoView()");time.sleep(1.6)
            pg.screenshot(path=f'{out}{w}-{sec}.jpg',type='jpeg',quality=82)
        pg.evaluate("window.scrollTo(0,document.body.scrollHeight)");time.sleep(1.2);pg.screenshot(path=f'{out}{w}-footer.jpg',type='jpeg',quality=82)
        r=pg.evaluate(CHK)
        if r['overflow']>0: r['wide']=pg.evaluate("[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>document.documentElement.clientWidth+1&&!e.closest('.strip,.rows,.hero__bg,.dock,.nav')).map(e=>e.tagName+'.'+e.className+':'+Math.round(e.getBoundingClientRect().right)).slice(0,6)")
        print(w,{k:v for k,v in r.items() if k not in('small',)},errs);c.close()
    b.close()
