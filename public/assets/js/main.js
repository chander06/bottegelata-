document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Anno nel footer
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Titolo parola per parola (testo intero resta per gli screen reader)
  document.querySelectorAll('[data-words]').forEach(function (h) {
    if (reduce) return;
    h.setAttribute('aria-label', h.textContent.trim());
    var i = 0;
    var walk = function (node, parent) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'word'; w.setAttribute('aria-hidden', 'true');
            var inner = document.createElement('span'); inner.style.setProperty('--i', i++); inner.textContent = p;
            w.appendChild(inner); frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) { walk(child); }
      });
    };
    walk(h);
  });

  // Comparsa allo scroll
  var reveals = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // Menu mobile
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 900) setMenu(false); }, { passive: true });
  }

  // Nav, pulsante fisso e botte che si riempie
  var nav = document.querySelector('[data-nav]');
  var floatCta = document.querySelector('[data-float]');
  var sedi = document.getElementById('sedi');
  var story = document.querySelector('[data-story]');
  if (story && !reduce) story.classList.add('story--live');

  var ticking = false;
  function update() {
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    if (nav) nav.classList.toggle('is-scrolled', y > 40);

    if (floatCta) {
      var show = y > vh * 0.9;
      if (sedi) {
        var r = sedi.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) show = false;
      }
      if (document.body.scrollHeight - (y + vh) < 400) show = false;
      floatCta.classList.toggle('is-shown', show);
    }

    if (story && story.classList.contains('story--live')) {
      var s = story.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -s.top / (s.height - vh)));
      story.style.setProperty('--p', p.toFixed(3));
      story.setAttribute('data-active', p < 0.34 ? '0' : (p < 0.67 ? '1' : '2'));
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();
