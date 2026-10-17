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

  // Galeria w powiększeniu
  const box = document.getElementById('lightbox');
  if (box && typeof box.showModal === 'function') {
    const img = document.getElementById('lb-img');
    const cap = document.getElementById('lb-cap');
    document.querySelectorAll('.g-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        img.src = btn.dataset.src;
        img.alt = btn.querySelector('img').alt;
        cap.textContent = btn.dataset.caption || '';
        box.showModal();
      });
    });
    box.querySelector('.lb-close').addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  }


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
    // ok. 200 słów na minutę + 2 s na spojrzenie; minimum 5 s, maksimum 16 s
    const readTime = (t) => Math.min(16000, Math.max(5000, 2000 + t.trim().split(/\s+/).length * 300));
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

    render(); total = readTime(data[i].text); schedule(total);
  })();

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
