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

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
