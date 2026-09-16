/* Present mode for the eDamana ministerial briefing.
   Adds fullscreen entry, presenter click zones and Escape handling.
   The deck's authored animations, timing and sequencing are untouched:
   this file never rewrites a cue, never shortens one and never forces a
   slide to its end state. Navigation is left to <deck-stage>, which owns
   ArrowRight / ArrowLeft / Space / PageUp / PageDown and restarts a
   slide's entrance animation every time that slide becomes active. */
(function () {
  var stage = document.querySelector('deck-stage');
  var zone = document.getElementById('pmZone');
  var btn = document.getElementById('pmBtn');
  if (!stage || !btn) return;

  function activeSection() { return stage.querySelector('[data-deck-active]'); }

  /* Defensive: strip any inline animation override left on a slide by an
     older build. Authored cues live in the stylesheet, never inline, so
     anything found here would only be holding an entrance at its end
     state. Touch the DOM only when there is actually something to clear. */
  function clearOverrides(section) {
    var nodes = section.querySelectorAll('[data-anim]');
    for (var i = 0; i < nodes.length; i++) {
      var st = nodes[i].style;
      if (st.animationDelay || st.animationDuration || st.animationPlayState) {
        st.removeProperty('animation-delay');
        st.removeProperty('animation-duration');
        st.removeProperty('animation-play-state');
      }
    }
    section.removeAttribute('data-pm-settled');
  }

  /* Replay the active slide's authored entrance from the beginning by
     re-running the stage's own activation: drop [data-deck-active],
     flush style, put it back. The CSS cues are untouched — they simply
     start over at their authored delays and durations. */
  function replayActive() {
    var s = activeSection();
    if (!s) return;
    clearOverrides(s);
    s.removeAttribute('data-deck-active');
    void s.offsetWidth; // force a style flush so the animations restart
    s.setAttribute('data-deck-active', '');
  }

  /* Presenter click zones: right side advances, far left goes back.
     Both go straight through the stage, so the incoming slide plays its
     entrance from the start. */
  zone.addEventListener('click', function (e) {
    var x = e.clientX / window.innerWidth;
    if (x > 0.35) stage.next();
    else if (x < 0.22) stage.prev();
  });

  /* Escape leaves present mode. The browser exits fullscreen on Escape by
     itself (caught below via fullscreenchange), but exit() also runs here
     so the interface comes back even when the fullscreen request was
     refused and we are only presenting visually. */
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (document.body.hasAttribute('data-presenting')) exit();
  });

  function enter() {
    var el = document.documentElement;
    var req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    document.body.setAttribute('data-presenting', '');
    stage.setAttribute('no-rail', '');
    try { window.postMessage({ __omelette_presenting: true }, '*'); } catch (err) {}
    if (req) { var p = req.call(el); if (p && p.catch) p.catch(function () {}); }
    // Same slide, animation from the top.
    replayActive();
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
