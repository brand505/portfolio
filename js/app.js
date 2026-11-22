(function () {
  'use strict';
  var T = window.T, P = window.PROJECTS, D = window.DIMS || {};
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  var lang = store('ar-lang') === 'ar' ? 'ar' : 'en';
  var theme = store('ar-theme') === 'light' ? 'light' : 'dark';
  var tr = function (k) { return T[lang][k]; };
  var pick = function (o) { return o[lang]; };

  /* ---------- category definitions (order of the site) ---------- */
  var CATS = [
    { key: 'exp', n: '01', cover: 'P01' },
    { key: 'soc', n: '02', cover: 'P23' },
    { key: 'oth', n: '03', cover: 'P20' }
  ];
  var byCat = {};
  CATS.forEach(function (c) { byCat[c.key] = P.filter(function (p) { return p.cat === c.key; }); });

  /* ---------- build gallery once, translate on every language change ---------- */
  var useReveal = !reduce && 'IntersectionObserver' in window;
  CATS.forEach(function (c) {
    var sec = $('#' + c.key);
    sec.innerHTML = '<div class="cat-head"><h3 id="h-' + c.key + '"></h3><p></p></div><div class="gallery"></div>';
    var g = $('.gallery', sec);
    byCat[c.key].forEach(function (p) {
      var d = D[p.id] || [1200, 1200];
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'card' + (useReveal ? ' pre' : ''); b.dataset.id = p.id;
      b.style.setProperty('--ar', d[0] + ' / ' + d[1]);
      b.innerHTML = '<img src="assets/projects/thumb/' + p.id + '.webp" width="' + Math.min(900, d[0]) + '" height="' +
        Math.round(Math.min(900, d[0]) * d[1] / d[0]) + '" loading="' + (c.key === 'exp' ? 'eager' : 'lazy') + '" decoding="async" alt="">' +
        '<span class="meta"><b></b><span></span></span>';
      g.appendChild(b);
    });
  });

  /* ---------- hero name ---------- */
  function buildName() {
    var l1 = $('.l1'), l2 = $('.l2'), h = '';
    if (lang === 'ar') {
      l1.innerHTML = '<span class="ch" style="--i:0">أحمد</span>';
      l2.innerHTML = '<span class="ch" style="--i:1">رجب</span><span class="ch dot" style="--i:2">.</span>';
      $('#name').setAttribute('aria-label', 'أحمد رجب');
    } else {
      'AHMED'.split('').forEach(function (c, i) { h += '<span class="ch" style="--i:' + i + '">' + c + '</span>'; });
      l1.innerHTML = h; h = '';
      'RAGAB'.split('').forEach(function (c, i) { h += '<span class="ch" style="--i:' + (i + 5) + '">' + c + '</span>'; });
      l2.innerHTML = h + '<span class="ch dot" style="--i:10">.</span>';
      $('#name').setAttribute('aria-label', 'Ahmed Ragab');
    }
    var gh = $('#ghost');
    gh.textContent = lang === 'ar' ? 'AHMED RAGAB' : 'أحمد رجب';
    gh.classList.toggle('lat', lang === 'ar');
  }

  /* ---------- text updates ---------- */
  function applyLang() {
    root.lang = lang; root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = tr('meta.title');
    $$('[data-i18n]').forEach(function (el) { var v = tr(el.dataset.i18n); if (typeof v === 'string') el.textContent = v; });
    $$('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', tr(el.dataset.i18nAria)); });
    buildName();

    // band
    var items = tr('strip').split(' · '), g = '';
    items.forEach(function (t, i) { g += (i ? '<i></i>' : '') + '<b style="font-weight:inherit">' + t + '</b>'; });
    g += '<i></i>';
    $('#strip').innerHTML = '<span>' + g + '</span><span>' + g + '</span>';

    $('#interests').innerHTML = tr('about.int').map(function (t) { return '<li>' + t + '</li>'; }).join('');
    $('#whyList').innerHTML = tr('why.items').map(function (x) { return '<div class="why-item"><h3>' + x[0] + '</h3><p>' + x[1] + '</p></div>'; }).join('');
    var marks = ['Ps', 'Ai', 'Ae', 'Pr'];
    $('#toolGrid').innerHTML = tr('tools.items').map(function (x, i) {
      return '<article class="tool"><div class="mark" aria-hidden="true">' + marks[i] + '</div><h3>' + x[0] + '</h3><p>' + x[1] + '</p></article>';
    }).join('');

    // index + category headers
    $('#index').innerHTML = CATS.map(function (c) {
      return '<li><a href="#' + c.key + '" data-cover="' + c.cover + '"><span class="n">' + c.n + '</span><span class="t">' + tr('cat.' + c.key) +
        '</span><span class="c">' + byCat[c.key].length + ' ' + tr('work.count') + '</span></a></li>';
    }).join('');
    CATS.forEach(function (c) {
      var sec = $('#' + c.key);
      $('h3', sec).textContent = c.n + ' ' + tr('cat.' + c.key);
      $('.cat-head p', sec).textContent = tr('cat.' + c.key + '.d');
    });

    // cards
    $$('.card').forEach(function (b) {
      var p = P.filter(function (x) { return x.id === b.dataset.id; })[0];
      $('b', b).textContent = pick(p.title);
      var line = (p.series ? tr('series.' + p.series) + ', ' : '') + tr('badge.concept');
      $('.meta span', b).textContent = line;
      $('img', b).alt = pick(p.title) + '. ' + pick(p.desc);
      b.setAttribute('aria-label', pick(p.title) + ', ' + tr('badge.concept'));
    });
    $('#lang').setAttribute('aria-pressed', lang === 'ar');
    if (dlg.open) fillCase();
    bindPeek();
  }

  /* ---------- theme ---------- */
  function applyTheme(animate) {
    if (animate) { root.classList.add('theming'); setTimeout(function () { root.classList.remove('theming'); }, 650); }
    root.dataset.theme = theme;
    var m = $('meta[name="theme-color"]'); if (m) m.content = theme === 'dark' ? '#0B0614' : '#F5F0FA';
  }
  $('#theme').addEventListener('click', function () { theme = theme === 'dark' ? 'light' : 'dark'; store('ar-theme', theme); applyTheme(true); });
  $('#lang').addEventListener('click', function () { lang = lang === 'en' ? 'ar' : 'en'; store('ar-lang', lang); applyLang(); });

  /* ---------- mobile menu ---------- */
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.hidden = !open; burger.setAttribute('aria-expanded', open); root.classList.toggle('noscroll', open);
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* ---------- case study ---------- */
  var dlg = $('#case'), cur = 0, lastBtn = null;
  var order = P; // site order
  function fillCase() {
    var p = order[cur], c = CATS.filter(function (x) { return x.key === p.cat; })[0];
    var img = $('#caseImg'); img.src = 'assets/projects/full/' + p.id + '.jpg'; img.alt = pick(p.title) + '. ' + pick(p.desc);
    $('#caseMeta').textContent = tr('cat.' + p.cat) + ', ' + tr('badge.concept');
    $('#caseTitle').textContent = pick(p.title);
    $('#caseDesc').textContent = pick(p.desc);
    $('#caseConcept').textContent = pick(p.concept);
    $('#caseApproach').textContent = pick(p.approach);
    $('#caseCount').textContent = String(cur + 1).padStart(2, '0') + ' / ' + order.length;
  }
  function openCase(id, btn) {
    cur = order.map(function (p) { return p.id; }).indexOf(id); lastBtn = btn || null;
    fillCase();
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0; root.classList.add('noscroll');
  }
  function step(d) { cur = (cur + d + order.length) % order.length; fillCase(); dlg.scrollTop = 0; }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.card'); if (b) openCase(b.dataset.id, b);
  });
  $('#caseClose').addEventListener('click', function () { dlg.close(); });
  $('#casePrev').addEventListener('click', function () { step(-1); });
  $('#caseNext').addEventListener('click', function () { step(1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { root.classList.remove('noscroll'); });
  dlg.addEventListener('keydown', function (e) {
    var rtl = root.dir === 'rtl';
    if (e.key === 'ArrowLeft') step(rtl ? 1 : -1);
    if (e.key === 'ArrowRight') step(rtl ? -1 : 1);
  });

  /* ---------- cursor preview on the collection index ---------- */
  var peek = $('#peek'), peekImg = $('#peekImg'), px = 0, py = 0, tx = 0, ty = 0, peekRaf = 0;
  function peekLoop() {
    px += (tx - px) * .18; py += (ty - py) * .18;
    peek.style.transform = 'translate3d(' + (px + 24) + 'px,' + (py + 24) + 'px,0)';
    peekRaf = peek.classList.contains('on') ? requestAnimationFrame(peekLoop) : 0;
  }
  function bindPeek() {
    if (!canHover || reduce) return;
    $$('#index a').forEach(function (a) {
      a.addEventListener('pointerenter', function (e) {
        peekImg.src = 'assets/projects/thumb/' + a.dataset.cover + '.webp'; tx = px = e.clientX; ty = py = e.clientY;
        peek.classList.add('on'); if (!peekRaf) peekLoop();
      });
      a.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; });
      a.addEventListener('pointerleave', function () { peek.classList.remove('on'); });
    });
  }

  /* ---------- contact form (mailto, no server needed) ---------- */
  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, n = f.name.value.trim(), m = f.email.value.trim(), t = f.message.value.trim();
    var ok = n && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m) && t, st = $('#formStatus');
    $$('.field', f).forEach(function (fl) { var i = $('input,textarea', fl); fl.classList.toggle('bad', !i.value.trim()); });
    if (!ok) { st.className = 'status err'; st.textContent = tr('form.err'); return; }
    var body = t + '\n\n' + n + '\n' + m;
    st.className = 'status'; st.textContent = tr('form.ok');
    window.location.href = 'mailto:9hmed7agab@gmail.com?subject=' + encodeURIComponent('Portfolio message from ' + n) + '&body=' + encodeURIComponent(body);
  });

  /* ---------- scroll: header, hero exit, card reveal and parallax ---------- */
  var bar = $('#bar'), hero = $('.hero'), ticking = false, parCards = [];
  function onScroll() {
    var y = window.scrollY, h = hero.offsetHeight, p = Math.min(1, Math.max(0, y / h));
    bar.classList.toggle('solid', y > 30);
    if (!reduce && y < h * 1.2) {
      hero.style.setProperty('--py', (y * .22).toFixed(1) + 'px');
      hero.style.setProperty('--hy', (y * .12).toFixed(1) + 'px');
      hero.style.setProperty('--ho', (1 - p * .9).toFixed(3));
      hero.style.setProperty('--sp', p.toFixed(3));
    }
    if (!reduce && window.innerWidth > 720) {
      var vh = window.innerHeight;
      parCards.forEach(function (o) {
        var r = o.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        o.el.style.translate = '0 ' + (((r.top + r.height / 2) - vh / 2) * o.k).toFixed(1) + 'px';
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', function () { requestAnimationFrame(onScroll); });

  if (useReveal) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .1, rootMargin: '0px 0px -6% 0px' });
    $$('.card').forEach(function (c) { io.observe(c); });
  }
  if (!reduce) $$('.cat-exp .card').forEach(function (el, i) { parCards.push({ el: el, k: (i % 2 ? .05 : -.04) }); });

  /* ---------- hero: pointer light + letters that flip near the cursor ---------- */
  if (canHover && !reduce) {
    var hotRaf = 0, hx = 0, hy = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      hx = e.clientX; hy = e.clientY;
      if (!hotRaf) hotRaf = requestAnimationFrame(function () {
        hotRaf = 0;
        $$('.name .ch').forEach(function (c) {
          var b = c.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
          var rad = Math.max(b.height, b.width) * .62;
          c.classList.toggle('hot', Math.hypot(hx - cx, hy - cy) < rad);
        });
      });
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { $$('.name .ch.hot').forEach(function (c) { c.classList.remove('hot'); }); });
  }

  applyTheme(false);
  applyLang();
  onScroll();
})();
