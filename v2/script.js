/* Bonjour Bébé — interactions run locally; answers are never persisted. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menu = $('#menu');
  const menuButton = $('.menu-button');
  function closeMenu() { menu.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });
  $$('a', menu).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMenu(); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  function moveTrack(track, direction) {
    const child = track.firstElementChild;
    const distance = child ? child.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0) : track.clientWidth * .8;
    track.scrollBy({ left: distance * direction, behavior: reducedMotion ? 'instant' : 'smooth' });
  }
  $$('[data-scroll]').forEach(button => button.addEventListener('click', () => moveTrack(document.getElementById(button.dataset.scroll), Number(button.dataset.direction))));
  $$('.card-track').forEach(track => track.addEventListener('keydown', e => {
    if (e.target !== track) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); moveTrack(track, e.key === 'ArrowRight' ? 1 : -1); }
  }));

  let returnFocus = null;
  function openDialog(dialog, trigger) {
    returnFocus = trigger || document.activeElement;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    document.body.classList.add('dialog-open');
    $('[data-close]', dialog).focus();
  }
  function closeDialog(dialog) {
    if (typeof dialog.close === 'function') dialog.close(); else { dialog.removeAttribute('open'); restoreFocus(); }
  }
  function restoreFocus() { document.body.classList.remove('dialog-open'); if (returnFocus?.isConnected) returnFocus.focus(); }
  $$('dialog').forEach(dialog => {
    $('[data-close]', dialog).addEventListener('click', () => closeDialog(dialog));
    dialog.addEventListener('close', restoreFocus);
    dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(dialog); } });
  });
  const activityContent = {
    sensory: ['Zmysły i tworzenie', 'Rączki pełne pomysłów', 'Sensoplastyka® i zabawy sensoryczne zapraszają do poznawania faktur, kolorów i właściwości materiałów. Dajemy przestrzeń na własny pomysł i radość próbowania.', 'Dziecko może najpierw obserwować, dotknąć jednym palcem albo od razu zanurzyć się w zabawie. Szanujemy jego gotowość.'],
    music: ['Muzyka i ruch', 'Mały rytm, wielka radość', 'Grajki Małej Zgrajki w nurcie Music Care, logorytmika oraz zabawy muzyczne łączą słuchanie z ruchem i wspólnym doświadczaniem dźwięku.', 'Śpiew, rytm i instrumenty są zaproszeniem do kontaktu. Nie oczekujemy występów — ważne jest wspólne przeżywanie.'],
    nature: ['Zwierzęta i natura', 'Ciekawość ma łapki', 'Dogoterapia, alpakoterapia i spotkania z AnimalEdu pozwalają poznawać zwierzęta w towarzystwie prowadzących. Rozmawiamy o delikatności i szacunku do żywych istot.', 'Udział dostosowujemy do gotowości dziecka. Obserwacja z dystansu też jest sposobem uczestniczenia. Aktualne terminy oraz zasady spotkań omawiamy z rodzicami.'],
    stories: ['Słowo i wyobraźnia', 'Historie, które ożywają', 'Pani Teatrzyk, codzienne czytanie i zabawy z językiem angielskim otwierają przestrzeń na opowieści, gesty i nowe słowa.', 'Książki są na wyciągnięcie ręki. Wspieramy ciekawość języka i swobodną zabawę wyobraźnią, bez sprawdzania i porównywania.']
  };
  const infoDialog = $('#info-dialog');
  function setInfo(label, title, paragraphs) {
    $('#dialog-label').textContent = label;
    $('#dialog-title').textContent = title;
    const body = $('#dialog-body'); body.replaceChildren();
    paragraphs.forEach(text => { const p = document.createElement('p'); p.textContent = text; body.append(p); });
  }
  $$('[data-activity]').forEach(button => button.addEventListener('click', () => {
    const [label, title, ...paragraphs] = activityContent[button.dataset.activity];
    setInfo(label, title, [...paragraphs, 'Zajęcia odbywają się zgodnie z harmonogramem programu dodatkowego. Aktualną ofertę, terminy i opłaty prześlemy na życzenie.']);
    $('#dialog-contact').hidden = false;
    openDialog(infoDialog, button);
  }));
  $('#dialog-contact').addEventListener('click', () => { returnFocus = null; closeDialog(infoDialog); });
  $('#privacy-open').addEventListener('click', e => {
    setInfo('Prywatność', 'Spokojnie, to tylko Wasza ścieżka.', ['Odpowiedzi w ścieżce „Czy Bonjour Bébé jest dla nas?” są używane wyłącznie podczas otwarcia tej strony. Nie wysyłamy ich na serwer ani nie zapisujemy w pamięci przeglądarki. Po odświeżeniu znikają.', 'Ta strona nie zawiera analityki, reklam ani formularza zbierającego dane. Linki do telefonu i poczty uruchamiają wybraną przez Ciebie aplikację; odnośniki do map i zasad świadczenia prowadzą do zewnętrznych serwisów.', 'Jeśli napiszesz do żłobka, administratorem danych z korespondencji jest Anna Frach-Popielarska prowadząca Bonjour Bébé, ul. J.H. Dąbrowskiego 32/1U, 50-457 Wrocław, biuro@bonjourbebe.pl. Dane wykorzystujemy do odpowiedzi i obsługi Twojego zapytania. Pełną informację o przetwarzaniu danych otrzymasz przy rekrutacji.']);
    $('#dialog-contact').hidden = true;
    openDialog(infoDialog, e.currentTarget);
  });

  const galleryLinks = $$('[data-gallery]');
  const galleryDialog = $('#gallery-dialog');
  let galleryIndex = 0;
  function showPhoto(index) {
    galleryIndex = (index + galleryLinks.length) % galleryLinks.length;
    const link = galleryLinks[galleryIndex];
    $('#gallery-full').src = link.getAttribute('href');
    $('#gallery-full').alt = $('img', link).alt;
    $('#gallery-caption').textContent = $('span', link).textContent.replace('↗', '').trim();
    $('#gallery-count').textContent = `${galleryIndex + 1} / ${galleryLinks.length}`;
  }
  galleryLinks.forEach((link, index) => link.addEventListener('click', e => { e.preventDefault(); showPhoto(index); openDialog(galleryDialog, link); }));
  $('#gallery-prev').addEventListener('click', () => showPhoto(galleryIndex - 1));
  $('#gallery-next').addEventListener('click', () => showPhoto(galleryIndex + 1));
  galleryDialog.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); showPhoto(galleryIndex + (e.key === 'ArrowRight' ? 1 : -1)); } });
  let touchStart = null;
  $('#gallery-full').addEventListener('touchstart', e => { touchStart = e.changedTouches[0].clientX; }, { passive: true });
  $('#gallery-full').addEventListener('touchend', e => { if (touchStart === null) return; const delta = e.changedTouches[0].clientX - touchStart; if (Math.abs(delta) > 55) showPhoto(galleryIndex + (delta < 0 ? 1 : -1)); touchStart = null; }, { passive: true });

  const days = {
    morning: ['☼', 'Każdy dzień zaczyna się od relacji.', 'Spokojne powitania, czas na swobodną zabawę i wspólne śniadanie. Pomagamy wejść w żłobkową codzienność z poczuciem bezpieczeństwa.'],
    discover: ['✳', 'Ciekawość prowadzi nas dalej.', 'Zabawy, aktywności i zajęcia dodatkowe przeplatamy swobodnym odkrywaniem. Spacerujemy i poznajemy otoczenie, dostosowując wyjścia do pogody, jakości powietrza i potrzeb grupy.'],
    rest: ['◡', 'Jest też czas na zwolnienie.', 'Po zupie przychodzi pora na wyciszenie i odpoczynek. Wspieramy dzieci w przejściu od aktywności do spokoju, z uważnością na ich potrzeby. Po odpoczynku podajemy drugie danie.'],
    afternoon: ['↗', 'Jeszcze chwila zabawy. I do zobaczenia.', 'Swobodna zabawa, spokojniejsze aktywności i podwieczorek. Przy odbiorze jest czas na kontakt z rodzicem i opowiedzenie o dniu dziecka.']
  };
  const dayTabs = $$('[data-day]');
  function selectDay(tab) {
    dayTabs.forEach(t => { t.setAttribute('aria-selected', String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
    const [symbol, title, text] = days[tab.dataset.day];
    const panel = $('#day-panel'); panel.setAttribute('aria-labelledby', tab.id);
    $('.day-symbol', panel).textContent = symbol; $('h3', panel).textContent = title; $('p', panel).textContent = text;
  }
  dayTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectDay(tab));
    tab.addEventListener('keydown', e => {
      let next;
      if (['ArrowRight', 'ArrowDown'].includes(e.key)) next = (i + 1) % dayTabs.length;
      if (['ArrowLeft', 'ArrowUp'].includes(e.key)) next = (i - 1 + dayTabs.length) % dayTabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = dayTabs.length - 1;
      if (next !== undefined) { e.preventDefault(); selectDay(dayTabs[next]); dayTabs[next].focus(); }
    });
  });

  const questions = [
    { title: 'Co jest dla Was najważniejsze?', help: 'Wybierz temat, od którego chcesz zacząć.', options: [['adaptacja', 'Spokojna adaptacja'], ['zajecia', 'Zajęcia i odkrywanie'], ['dofinansowanie', 'Koszty i dotacje'], ['kadra', 'Podejście i kadra']] },
    { title: 'Kiedy myślicie o rozpoczęciu?', help: 'To wskazówka do rozmowy, nie rezerwacja miejsca.', options: [['soon', 'Szukamy miejsca teraz'], ['later', 'Za kilka miesięcy'], ['explore', 'Dopiero się rozglądamy']] },
    { title: 'Co jeszcze chcesz poznać?', help: 'Dobierzemy informacje przydatne przed wizytą.', options: [['plan-dnia', 'Rytm dnia i odpoczynek'], ['faq-food', 'Posiłki i catering'], ['kontakt', 'Dojazd i pierwsza wizyta'], ['miejsce', 'Przestrzeń żłobka']] }
  ];
  const topics = {
    adaptacja: ['Adaptacja krok po kroku', 'Jak zaczynamy razem z rodzicem.'],
    zajecia: ['Nasze zajęcia', 'Zmysły, muzyka, natura i wyobraźnia.'],
    dofinansowanie: ['Opłaty i dofinansowanie', 'Miejsca dotowane oraz „Aktywnie w żłobku”.'],
    kadra: ['Poznaj nasze podejście i kadrę', 'Ludzie i zasady naszej codziennej pracy.'],
    'plan-dnia': ['Poznaj rytm dnia', 'Zabawa, spacer, posiłki i odpoczynek.'],
    'faq-food': ['Posiłki i catering', 'Jak otrzymać aktualny jadłospis.'],
    kontakt: ['Zaplanuj pierwszą wizytę', 'Adres, dojazd i kontakt do Anny.'],
    miejsce: ['Zajrzyj do naszej przestrzeni', 'Kameralne wnętrze i autentyczne zdjęcia.']
  };
  let step = 0;
  let answers = ['', '', ''];
  const quizContent = $('#quiz-content');
  function focusQuizTitle() { const title = $('legend, .quiz-result-title', quizContent); if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); } }
  function renderQuiz(focus = false) {
    $('#quiz-count').textContent = step < 3 ? `KROK ${step + 1} Z 3` : 'WASZ POCZĄTEK';
    $$('.progress-bars i').forEach((bar, index) => bar.classList.toggle('active', index <= step));
    quizContent.replaceChildren();
    $('#quiz-back').hidden = step === 0;
    $('#quiz-next').hidden = step === 3;
    $('#quiz-next').textContent = step === 2 ? 'Zobacz wskazówki ↗' : 'Dalej →';
    if (step < 3) {
      const question = questions[step];
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend'); legend.textContent = question.title;
      const help = document.createElement('p'); help.className = 'quiz-help'; help.id = 'quiz-help'; help.textContent = question.help;
      fieldset.setAttribute('aria-describedby', 'quiz-help');
      const options = document.createElement('div'); options.className = 'quiz-options';
      question.options.forEach(([value, label]) => {
        const option = document.createElement('label'); option.className = 'quiz-option';
        const input = document.createElement('input'); input.type = 'radio'; input.name = 'answer'; input.value = value; input.required = true; input.checked = answers[step] === value;
        const text = document.createElement('span'); text.textContent = label;
        input.addEventListener('change', () => { answers[step] = value; });
        option.append(input, text); options.append(option);
      });
      fieldset.append(legend, help, options); quizContent.append(fieldset);
    } else {
      const result = document.createElement('div'); result.className = 'quiz-result';
      const title = document.createElement('h3'); title.className = 'quiz-result-title'; title.textContent = 'Zacznijmy od tego, co dla Was ważne.';
      const text = document.createElement('p');
      text.textContent = answers[1] === 'soon' ? 'Jeśli szukacie miejsca teraz, porozmawiajmy o dostępności i czasie na adaptację. Rekrutacja trwa cały rok, w miarę wolnych miejsc.' : answers[1] === 'later' ? 'Macie chwilę na spokojne poznanie miejsca. Zacznijcie od tych informacji, a termin i dostępność omówimy podczas rozmowy.' : 'Nie musicie jeszcze znać terminu. Poznajcie nas w swoim tempie — te informacje pomogą Wam przygotować pytania.';
      const links = document.createElement('div'); links.className = 'result-links';
      const targets = [...new Set([answers[0], answers[2], answers[0] === 'adaptacja' ? 'kadra' : 'adaptacja'])];
      targets.forEach(id => {
        const a = document.createElement('a'); a.href = '#' + id; a.className = 'result-link';
        const span = document.createElement('span'); span.textContent = topics[id][0];
        const small = document.createElement('small'); small.textContent = topics[id][1]; span.append(small);
        const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); a.append(span, arrow);
        a.addEventListener('click', () => { const target = document.getElementById(id); if (target?.tagName === 'DETAILS') target.open = true; });
        links.append(a);
      });
      const contact = document.createElement('a'); contact.className = 'button';
      const timing = questions[1].options.find(([id]) => id === answers[1])[1];
      const body = `Dzień dobry,\nchcielibyśmy poznać Bonjour Bébé i umówić spotkanie.\nNajbardziej interesuje nas: ${topics[answers[0]][0]}.\nTermin: ${timing}.\nChcielibyśmy też zapytać o: ${topics[answers[2]][0]}.\nProsimy o kontakt w sprawie wizyty i aktualnej oferty.\nPozdrawiamy`;
      contact.href = 'mailto:biuro@bonjourbebe.pl?subject=' + encodeURIComponent('Poznajmy się — Bonjour Bébé') + '&body=' + encodeURIComponent(body); contact.textContent = 'Napisz w sprawie spotkania ↗';
      const restart = document.createElement('button'); restart.type = 'button'; restart.className = 'text-link quiz-restart'; restart.textContent = 'Zacznij od nowa'; restart.addEventListener('click', () => { answers = ['', '', '']; step = 0; renderQuiz(true); });
      result.append(title, text, links, contact, restart); quizContent.append(result);
    }
    if (focus) focusQuizTitle();
  }
  $('#quiz-form').addEventListener('submit', e => { e.preventDefault(); const checked = $('input[name="answer"]:checked', quizContent); if (!checked || step >= 3) { if (step < 3) $('input', quizContent)?.focus(); return; } answers[step] = checked.value; step++; renderQuiz(true); });
  $('#quiz-back').addEventListener('click', () => { if (step > 0) { step--; renderQuiz(true); } });
  renderQuiz();

  // Opening an FAQ answer by a fragment also works for direct links.
  function revealHash() { const id = decodeURIComponent(location.hash.slice(1)); const target = document.getElementById(id); if (target?.tagName === 'DETAILS') target.open = true; }
  window.addEventListener('hashchange', revealHash); revealHash();
})();
