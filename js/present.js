/* Present mode for the eDamana ministerial briefing.
   Adds fullscreen entry, presenter key handling and click zones.
   The deck's authored animations, timing and sequencing are untouched:
   this file never rewrites a cue, it only lets the presenter skip ahead
   to a slide's settled state before advancing. */
(function () {
  var stage = document.querySelector('deck-stage');
  var bar = document.getElementById('pmBar');
  var zone = document.getElementById('pmZone');
  var btn = document.getElementById('pmBtn');
  if (!stage || !btn) return;

  var entered = 0;      // timestamp the active slide appeared
  var settleMs = 0;     // when its entrance animation finishes
  var skipped = false;  // presenter already jumped this slide to settled

  /* Longest authored cue on a slide: max --d plus the slowest entrance
     duration (1.1s, the draw animation). Read from the DOM so it always
     matches the slide as authored. */
  function settleTime(section) {
    if (!section) return 0;
    var max = 0;
    var nodes = section.querySelectorAll('[data-anim]');
    for (var i = 0; i < nodes.length; i++) {
      var d = parseFloat((nodes[i].style.getPropertyValue('--d') || '0').replace('s', '')) || 0;
      if (d > max) max = d;
    }
    return (max + 1.1) * 1000;
  }

  function activeSection() { return stage.querySelector('[data-deck-active]'); }

  /* Deferred a frame: the stage clears data-deck-active on the outgoing
     slide and sets it on the incoming one in the same mutation batch, so
     reading synchronously can land on no active slide at all. */
  var pending = 0;
  function markEntered() {
    if (pending) return;
    pending = requestAnimationFrame(function () {
      pending = 0;
      var s = activeSection();
      if (!s) { markEntered(); return; }
      entered = Date.now();
      settleMs = settleTime(s);
      skipped = false;
      s.removeAttribute('data-pm-settled');
      s.style.removeProperty('animation-delay');
    });
  }

  /* Freeze the entrance cues at their end state. Infinite motion (flow,
     pulse) keeps running — only the staged entrances are fast-forwarded. */
  function settleNow() {
    var s = activeSection();
    if (!s || skipped) return;
    var nodes = s.querySelectorAll('[data-anim="up"],[data-anim="fade"],[data-anim="scale"],[data-anim="sheet"],[data-anim="draw"]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.animationDelay = '0s';
      nodes[i].style.animationDuration = '1ms';
    }
    s.setAttribute('data-pm-settled', '');
    skipped = true;
  }

  function stillAnimating() {
    return !skipped && settleMs > 0 && (Date.now() - entered) < settleMs;
  }

  new MutationObserver(function () { markEntered(); })
    .observe(stage, { subtree: true, attributes: true, attributeFilter: ['data-deck-active'] });
  markEntered();

  /* Right / Space: finish the current slide's build first, then advance.
     Capture phase so this runs before the stage's own key handler; the
     event is only swallowed when we actually consumed it as a skip. */
  window.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (k === 'ArrowRight' || k === ' ' || k === 'Spacebar' || k === 'PageDown') {
      if (stillAnimating()) { settleNow(); e.preventDefault(); e.stopImmediatePropagation(); }
    } else if (k === 'Escape' && document.body.hasAttribute('data-presenting') && !document.fullscreenElement) {
      exit();
    }
  }, true);

  function advance(dir) {
    if (dir > 0 && stillAnimating()) { settleNow(); return; }
    dir > 0 ? stage.next() : stage.prev();
  }

  zone.addEventListener('click', function (e) {
    var x = e.clientX / window.innerWidth;
    if (x > 0.35) advance(1);
    else if (x < 0.22) advance(-1);
  });

  function enter() {
    var el = document.documentElement;
    var req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    document.body.setAttribute('data-presenting', '');
    stage.setAttribute('no-rail', '');
    try { window.postMessage({ __omelette_presenting: true }, '*'); } catch (err) {}
    if (req) { var p = req.call(el); if (p && p.catch) p.catch(function () {}); }
    markEntered();
  }

  function exit() {
    document.body.removeAttribute('data-presenting');
    stage.removeAttribute('no-rail');
    try { window.postMessage({ __omelette_presenting: false }, '*'); } catch (err) {}
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
  }

  btn.addEventListener('click', enter);
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement) exit();
  });
})();
