// Bonjour Bébé — claude-design: menu, „teraz w żłobku”, galeria
(function () {
  // Menu na telefonie
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  // „Teraz w żłobku” — zaznacza bieżący punkt planu dnia (czas w Polsce, dni robocze)
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  function markNow() {
    let now;
    try {
      const parts = new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23' }).formatToParts(new Date());
      const get = (type) => (parts.find((p) => p.type === type) || {}).value;
      const weekday = get('weekday') || '';
      if (/sob|niedz/i.test(weekday)) return;
      now = Number(get('hour')) * 60 + Number(get('minute'));
    } catch (e) { return; }
    const rows = document.querySelectorAll('.timeline li[data-from]');
    rows.forEach((li) => li.classList.remove('is-now'));
    const current = Array.from(rows).find((li) => now >= toMin(li.dataset.from) && now < toMin(li.dataset.to));
    const card = document.getElementById('now-card');
    if (current && card) {
      current.classList.add('is-now');
      document.getElementById('now-text').textContent = current.querySelector('span').firstChild.textContent;
      card.hidden = false;
    } else if (card) {
      card.hidden = true;
    }
  }
  markNow();
  setInterval(markNow, 60000);

  // Galeria: kliknięcie w zdjęcie otwiera pełnoekranowy pokaz; strzałki, klawisze ← → i przesunięcie palcem
  (function gallery() {
    const box = document.getElementById('lightbox');
    const dataEl = document.getElementById('gallery-data');
    if (!box || !dataEl || typeof box.showModal !== 'function') return;
    const photos = JSON.parse(dataEl.textContent);
    let set = photos; // aktualnie oglądany zestaw zdjęć (galeria sal albo galeria zajęć)
    const img = document.getElementById('lb-img');
    const cap = document.getElementById('lb-cap');
    const count = document.getElementById('lb-count');
    let i = 0;
    const preload = (n) => { const p = set[(n + set.length) % set.length]; if (p) { const im = new Image(); im.src = p.src; } };
    function show(n) {
      i = (n + set.length) % set.length;
      img.classList.add('is-loading');
      img.onload = () => img.classList.remove('is-loading');
      img.src = set[i].src;
      img.alt = set[i].cap;
      cap.textContent = set[i].cap;
      count.textContent = (i + 1) + ' / ' + set.length;
      preload(i + 1); preload(i - 1);
    }
    function openSet(arr, n) { set = arr; show(n); box.showModal(); document.body.style.overflow = 'hidden'; }
    window.bbOpenGallery = openSet;
    const main = document.querySelector('#gallery .g-wide');
    let k = 0;
    document.querySelectorAll('#gallery .g-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const start = btn === main ? k : (Number(btn.dataset.index) || 0);
        openSet(photos, start);
      });
    });

    // Po najechaniu myszką na duże zdjęcie galeria przewija się sama (tylko na urządzeniach z myszką)
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (main && canHover && !reduce && photos.length > 1) {
      const layers = [0, 1].map(() => { const im = document.createElement('img'); im.className = 'g-cycle'; im.alt = ''; im.setAttribute('aria-hidden', 'true'); main.append(im); return im; });
      const dots = document.createElement('span'); dots.className = 'g-dots'; dots.setAttribute('aria-hidden', 'true');
      photos.forEach(() => dots.append(document.createElement('i'))); main.append(dots);
      const mark = () => dots.querySelectorAll('i').forEach((d, n) => d.classList.toggle('on', n === k));
      let timer = null, front = 0;
      function step() {
        k = (k + 1) % photos.length;
        const next = layers[1 - front];
        next.onload = () => { next.classList.add('on'); layers[front].classList.remove('on'); front = 1 - front; };
        next.src = photos[k].src; mark();
      }
      main.addEventListener('mouseenter', () => {
        photos.forEach((p) => { const im = new Image(); im.src = p.src; });
        k = 0; mark(); main.classList.add('is-cycling');
        timer = setInterval(step, 1600);
      });
      main.addEventListener('mouseleave', () => {
        clearInterval(timer); timer = null; k = 0;
        layers.forEach((l) => l.classList.remove('on')); main.classList.remove('is-cycling');
      });
    }
    box.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.style.overflow = ''; });
    document.getElementById('lb-prev').addEventListener('click', () => show(i - 1));
    document.getElementById('lb-next').addEventListener('click', () => show(i + 1));
    box.querySelector('.lb-close').addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box || e.target.id === 'lb-stage') box.close(); });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
    });
    let x0 = null, y0 = null;
    const stage = document.getElementById('lb-stage');
    stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(dx < 0 ? i + 1 : i - 1);
      x0 = y0 = null;
    });
  })();


  // Zajęcia dodatkowe: kliknięcie w kartę otwiera okno z opisem i galerią zdjęć
  document.querySelectorAll('[data-open-activity]').forEach((btn) => {
    const dlg = document.getElementById(btn.dataset.openActivity);
    if (!dlg || typeof dlg.showModal !== 'function') return;
    const data = JSON.parse(dlg.querySelector('.act-data').textContent);
    btn.addEventListener('click', () => { dlg.showModal(); document.body.style.overflow = 'hidden'; });
    dlg.querySelector('.act-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.style.overflow = ''; });
    dlg.querySelectorAll('.act-photo').forEach((p) => {
      p.addEventListener('click', () => { if (window.bbOpenGallery) window.bbOpenGallery(data, Number(p.dataset.index) || 0); });
    });
  });

  // Opinie z Google: tylko 5 gwiazdek, czas wyświetlania zależny od długości tekstu
  (function reviews() {
    const box = document.getElementById('reviews');
    const data = (window.BB_REVIEWS || []).filter((r) => Number(r.rating) === 5 && r.text);
    if (!box || !data.length) return;
    box.hidden = false;
    const fig = document.getElementById('review');
    const textEl = document.getElementById('review-text');
    const authorEl = document.getElementById('review-author');
    const dots = document.getElementById('rv-dots');
    const bar = document.getElementById('rv-bar');
    const dotLabel = box.dataset.dotLabel || 'Opinia';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // ok. 200 słów na minutę + 2 s na spojrzenie; minimum 5 s, maksimum 25 s
    const readTime = (t) => Math.min(25000, Math.max(5000, 2000 + t.trim().split(/\s+/).length * 300));
    let i = 0, timer = null, start = 0, left = 0, total = 0, paused = false, raf = 0;

    data.forEach((_, n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', dotLabel + ' ' + (n + 1));
      b.addEventListener('click', () => go(n, true));
      dots.append(b);
    });
    if (data.length < 2) box.querySelector('.reviews-nav').hidden = true;

    function render() {
      const r = data[i];
      textEl.textContent = r.text;
      authorEl.textContent = r.author + (r.date ? ' · ' + r.date : '');
      dots.querySelectorAll('button').forEach((b, n) => b.setAttribute('aria-current', String(n === i)));
    }
    function tick() {
      if (paused || reduce) return;
      const elapsed = performance.now() - start;
      bar.style.width = Math.min(100, ((total - left + elapsed) / total) * 100) + '%';
      raf = requestAnimationFrame(tick);
    }
    function schedule(ms) {
      clearTimeout(timer); cancelAnimationFrame(raf);
      if (reduce || data.length < 2) { bar.style.width = '0%'; return; }
      left = ms; start = performance.now();
      timer = setTimeout(() => go(i + 1, false), ms);
      raf = requestAnimationFrame(tick);
    }
    function go(n, manual) {
      const next = (n + data.length) % data.length;
      fig.setAttribute('aria-live', manual ? 'polite' : 'off');
      fig.classList.add('is-fading');
      setTimeout(() => {
        i = next; render(); fig.classList.remove('is-fading');
        total = readTime(data[i].text); left = total; bar.style.width = '0%';
        if (!paused) schedule(total);
      }, reduce ? 0 : 300);
    }
    function pause() {
      if (paused) return; paused = true;
      clearTimeout(timer); cancelAnimationFrame(raf);
      left -= performance.now() - start;
    }
    function resume() {
      if (!paused) return; paused = false;
      if (left > 0) schedule(left);
    }
    document.getElementById('rv-prev').addEventListener('click', () => go(i - 1, true));
    document.getElementById('rv-next').addEventListener('click', () => go(i + 1, true));
    box.addEventListener('mouseenter', pause);
    box.addEventListener('mouseleave', resume);
    box.addEventListener('focusin', pause);
    box.addEventListener('focusout', (e) => { if (!box.contains(e.relatedTarget)) resume(); });
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : resume()));

    // stała wysokość karty = najdłuższa opinia, żeby strona nie „skakała” przy zmianie
    function lockHeight() {
      fig.style.minHeight = '';
      let max = 0;
      data.forEach((r) => {
        textEl.textContent = r.text;
        authorEl.textContent = r.author + (r.date ? ' · ' + r.date : '');
        max = Math.max(max, fig.offsetHeight);
      });
      fig.style.minHeight = max + 'px';
      render();
    }
    lockHeight();
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(lockHeight, 200); });

    render(); total = readTime(data[i].text); schedule(total);
  })();


  // Kopiowanie adresu e-mail (dla osób korzystających z poczty w przeglądarce)
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      const done = () => { btn.textContent = btn.dataset.done || label; btn.classList.add('is-done'); setTimeout(() => { btn.textContent = label; btn.classList.remove('is-done'); }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => selectFallback(text, done));
      } else { selectFallback(text, done); }
    });
  });
  function selectFallback(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.append(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    ta.remove();
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Pasek „Napisz / Zadzwoń” na telefonie: w przeglądarkach wbudowanych w aplikacje (Messenger, Facebook,
  // Instagram, Google) dolny pasek potrafi „zawisnąć” w połowie ekranu przy przewijaniu. Przyklejamy go
  // do dolnej krawędzi widocznej części strony (visualViewport).
  (function stickyBar() {
    const bar = document.querySelector('.mobile-bar');
    const vv = window.visualViewport;
    if (!bar || !vv) return;
    let raf = 0;
    const place = () => {
      raf = 0;
      const gap = window.innerHeight - (vv.height + vv.offsetTop);
      bar.style.transform = gap > 1 ? 'translate3d(0,' + (-gap) + 'px,0)' : 'translate3d(0,0,0)';
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(place); };
    vv.addEventListener('resize', queue);
    vv.addEventListener('scroll', queue);
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    place();
  })();
})();
