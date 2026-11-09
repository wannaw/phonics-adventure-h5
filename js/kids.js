(function () {
  const core = window.KidsCore;
  const screen = document.getElementById('screen');
  const toast = document.getElementById('toast');
  const STORAGE_KEY = 'phonics-kids-progress-v1';
  const state = {
    islands: [], lessons: [], progress: { completed: {} },
    lessonId: null, wordIndex: 0, quizStep: 0, mistakes: 0,
    listenCorrect: false, selectedChunks: [], spellingCorrect: false, feedback: '',
    openIslandId: null
  };
  let toastTimer;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const lessonById = id => state.lessons.find(lesson => lesson.id === id);
  const lessonIndex = id => state.lessons.findIndex(lesson => lesson.id === id);
  const islandById = id => state.islands.find(island => island.id === id);
  const countDone = () => Object.keys(state.progress.completed).length;

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); }
    catch { notify('当前浏览器无法保存进度'); }
  }

  function header(title, back = '#/map') {
    return `<header class="page-header"><a class="back-button" href="${back}" aria-label="返回">←</a><span>${esc(title)}</span><span class="header-sparkle" aria-hidden="true">✦</span></header>`;
  }

  function nav(active) {
    return `<nav class="bottom-nav" aria-label="主导航">
      <a href="#/home" ${active === 'home' ? 'aria-current="page"' : ''}><span aria-hidden="true">⌂</span>首页</a>
      <a href="#/map" ${active === 'map' ? 'aria-current="page"' : ''}><span aria-hidden="true">◈</span>地图</a>
      <a href="#/library" ${active === 'library' ? 'aria-current="page"' : ''}><span aria-hidden="true">▤</span>规则库</a>
    </nav>`;
  }

  function renderHome() {
    const lesson = state.lessons[core.nextLevelIndex(state.lessons, state.progress)];
    screen.innerHTML = `<div class="home-page page-with-nav">
      <div class="sky-decoration cloud-one" aria-hidden="true"></div><div class="sky-decoration cloud-two" aria-hidden="true"></div>
      <header class="home-top"><span class="brand-mark">✦</span><span>拼读探险岛</span><span class="top-badge">${countDone()} / ${state.lessons.length} 关</span></header>
      <section class="hero-land" aria-labelledby="home-title"><div class="hero-copy"><p class="eyebrow">PHONICS ADVENTURE</p><h1 id="home-title" tabindex="-1">拼读探险岛</h1><p class="hero-subtitle">听一听，拼一拼<br>每一天都有新发现！</p></div>
        <div class="hero-scene" aria-hidden="true"><span class="sun"></span><span class="far-island"></span><span class="main-island"></span><img src="./icons/explorer-penguin.webp" alt=""></div>
        <a class="primary-button hero-button" href="#/lesson/${encodeURIComponent(lesson.id)}"><span aria-hidden="true">▶</span> ${countDone() === state.lessons.length ? '再玩一关' : '继续探险'}</a></section>
      <section class="home-progress" aria-labelledby="daily-title"><div class="progress-title"><span class="treasure" aria-hidden="true">★</span><div><h2 id="daily-title">今天学一关</h2><p>从第 ${lesson.number} 关开始 · ${esc(islandById(lesson.islandId).name)}</p></div></div><div class="progress-track"><span style="width:${Math.round(countDone() / state.lessons.length * 100)}%"></span></div><p class="progress-caption">已完成 ${countDone()} 关，慢慢来就很棒！</p></section>
      <div class="home-links"><a href="#/map">查看探险地图 <span aria-hidden="true">→</span></a><a href="#/library">拼读规则库 <span aria-hidden="true">→</span></a></div>
      <footer class="credit">基于 <a href="https://github.com/cocojojo5213/phonics-app" target="_blank" rel="noopener noreferrer">Phonics App</a> 开发</footer>${nav('home')}</div>`;
  }

  function renderMap() {
    const current = core.nextLevelIndex(state.lessons, state.progress);
    const openIsland = islandById(state.openIslandId);
    const hotspots = state.islands.map((island, islandIndex) => {
      const lessons = state.lessons.filter(lesson => lesson.islandId === island.id);
      const earned = lessons.filter(lesson => state.progress.completed[lesson.id]).length;
      return `<button class="map-hotspot map-hotspot-${islandIndex + 1}" data-action="open-island" data-id="${esc(island.id)}" aria-label="打开${esc(island.name)}：${esc(island.mapLabel)}关卡，已完成 ${earned} / ${lessons.length} 关"><span class="map-marker-label" aria-hidden="true">${esc(island.mapLabel)}</span></button>`;
    }).join('');
    let drawer = '';
    if (openIsland) {
      const islandIndex = state.islands.indexOf(openIsland);
      const lessons = state.lessons.filter(lesson => lesson.islandId === openIsland.id);
      const earned = lessons.filter(lesson => state.progress.completed[lesson.id]).length;
      drawer = `<div class="island-overlay"><button class="island-backdrop" data-action="close-island" aria-label="关闭关卡列表"></button>
        <section class="island-drawer" role="dialog" aria-modal="true" aria-labelledby="island-title" aria-describedby="island-hint">
          <div class="drawer-handle" aria-hidden="true"></div><div class="drawer-heading"><div><p>${esc(openIsland.mapLabel)} · 第 ${islandIndex + 1} 座岛 · 已完成 ${earned}/${lessons.length} 关</p><h2 id="island-title">${esc(openIsland.name)}</h2></div><button class="drawer-close" data-action="close-island" aria-label="关闭">×</button></div>
          <p class="drawer-hint" id="island-hint">${esc(openIsland.hint)}</p><div class="level-grid">${lessons.map(lesson => {
            const index = lessonIndex(lesson.id);
            const score = state.progress.completed[lesson.id] || 0;
            const unlocked = core.isUnlocked(index, state.lessons, state.progress);
            return `<button class="level-node ${score ? 'done' : index === current ? 'current' : ''}" data-action="open-level" data-id="${esc(lesson.id)}" ${!unlocked ? 'disabled' : ''} aria-label="第 ${lesson.number} 关 ${esc(lesson.pattern)}，${score ? score + '颗星' : unlocked ? '可开始' : '未解锁'}"><strong>${esc(lesson.pattern)}</strong><small>${score ? '★'.repeat(score) : unlocked ? '开始' : '🔒'}</small></button>`;
          }).join('')}</div></section></div>`;
    }
    screen.innerHTML = `<div class="map-page"><div class="map-underlay" ${openIsland ? 'inert' : ''}>
      <main class="map-scene"><h1 class="sr-only" tabindex="-1">探险地图</h1><a class="map-back" href="#/home" aria-label="返回首页">←</a>${hotspots}</main>${nav('map')}</div>${drawer}</div>`;
    if (openIsland) screen.querySelector('.drawer-close')?.focus({ preventScroll: true });
  }

  function renderLibrary() {
    const groups = state.islands.map((island, index) => {
      const lessons = state.lessons.filter(lesson => lesson.islandId === island.id);
      return `<details class="library-group" open><summary><span class="library-group-number">${String(index + 1).padStart(2, '0')}</span><span class="library-group-title"><strong>${esc(island.mapLabel)} · ${esc(island.name)}</strong><small>${esc(island.hint)}</small></span><span class="library-group-count">${lessons.length} 条</span></summary>
        <div class="library-nodes">${lessons.map(lesson => `<a class="library-node" href="#/rule/${encodeURIComponent(lesson.id)}" aria-label="查看 ${esc(lesson.pattern)} 规则"><strong>${esc(lesson.pattern)}</strong><span>${esc(lesson.ipa)}</span><small>听读 →</small></a>`).join('')}</div></details>`;
    }).join('');
    screen.innerHTML = `<div class="library-page page-with-nav">${header('拼读规则库')}
      <section class="library-intro"><p class="eyebrow">SOUND COLLECTION</p><h1 tabindex="-1">找到想学的声音</h1><p>点开一张规则卡，听单词、看拼读，再去闯关。</p></section>
      <div class="library-groups">${groups}</div><a class="library-advanced" href="./classic.html#/learn">查看完整 107 条进阶规则 <span aria-hidden="true">→</span></a>${nav('library')}</div>`;
  }

  function renderRule(lesson) {
    const island = islandById(lesson.islandId);
    const unlocked = core.isUnlocked(lessonIndex(lesson.id), state.lessons, state.progress);
    screen.innerHTML = `<div class="rule-page page-with-nav">${header('规则卡', '#/library')}
      <section class="rule-hero"><span class="chapter-pill">${esc(island.mapLabel)} · ${esc(island.name)}</span><p class="eyebrow">第 ${lesson.number} / ${state.lessons.length} 张规则卡</p><h1 tabindex="-1">${esc(lesson.pattern)}</h1><strong class="rule-ipa">${esc(lesson.ipa)}</strong><p>${esc(lesson.hint)}</p></section>
      <section class="rule-examples"><h2>听一听，读一读</h2><p>点喇叭听发音，再跟着拼读。</p><div class="rule-word-list">${lesson.words.map(word => `<div class="rule-word-row"><div><strong class="rule-word">${highlightedWord(word, lesson.pattern)}</strong><span class="rule-meaning">${esc(word.meaning)}</span><small>${esc(word.chunks.join(' · '))}</small></div><button class="rule-play" data-action="play" data-word="${esc(word.word)}" aria-label="播放单词 ${esc(word.word)}">🔊</button></div>`).join('')}</div></section>
      <div class="rule-action">${unlocked ? `<button class="primary-button" data-action="open-level" data-id="${esc(lesson.id)}">开始第 ${lesson.number} 关 →</button>` : '<p>完成前面的关卡后解锁闯关；规则卡可以随时复习。</p><a class="secondary-button" href="#/map">去探险地图 →</a>'}</div>${nav('library')}</div>`;
  }

  function highlightedWord(word, pattern) {
    const text = word.word;
    if (pattern.includes('_')) {
      const [first, last] = pattern.split('_');
      const a = text.indexOf(first);
      const e = text.lastIndexOf(last);
      return [...text].map((letter, index) => `<span class="${index === a || index === e ? 'word-focus' : ''}">${esc(letter)}</span>`).join('');
    }
    const at = text.indexOf(pattern);
    if (at < 0) return esc(text);
    return `${esc(text.slice(0, at))}<span class="word-focus">${esc(pattern)}</span>${esc(text.slice(at + pattern.length))}`;
  }

  function renderLesson(lesson) {
    const word = lesson.words[state.wordIndex];
    const island = islandById(lesson.islandId);
    screen.innerHTML = `<div class="lesson-page">${header(`第 ${lesson.number} 关 · ${lesson.pattern}`)}
      <div class="lesson-intro"><span class="chapter-pill">${island.icon} ${esc(island.name)}</span><h1 tabindex="-1">认识新声音 <em>${esc(lesson.pattern)}</em></h1><p class="rule-hint">${esc(lesson.hint)}</p></div>
      <div class="step-progress" aria-label="第 ${state.wordIndex + 1} 个，共 ${lesson.words.length} 个单词"><span style="width:${(state.wordIndex + 1) / lesson.words.length * 100}%"></span></div>
      <section class="word-card" aria-label="单词卡片"><div class="word-card-top"><span class="word-number">单词 ${state.wordIndex + 1} / ${lesson.words.length}</span><span class="card-sticker" aria-hidden="true">✦</span></div><div class="word-illustration" aria-hidden="true"><span class="illustration-circle"></span><img src="./icons/explorer-penguin.webp" alt=""></div>
        <p class="large-word ${word.word.length >= 5 ? 'long-word' : ''}">${highlightedWord(word, lesson.pattern)}</p><p class="word-meaning">${esc(word.meaning)}</p><div class="chunk-row" aria-label="拼读拆解 ${esc(word.chunks.join('，'))}">${word.chunks.map(chunk => `<span>${esc(chunk)}</span>`).join('<b aria-hidden="true">·</b>')}</div>
        <button class="audio-button" data-action="play" data-word="${esc(word.word)}" aria-label="播放单词 ${esc(word.word)}"><span aria-hidden="true">🔊</span> 听发音</button></section>
      <div class="lesson-actions"><button class="secondary-button" data-action="prev-word" ${state.wordIndex === 0 ? 'disabled' : ''}>上一词</button><button class="primary-button" data-action="next-word">${state.wordIndex === lesson.words.length - 1 ? '去闯关' : '下一个'} <span aria-hidden="true">→</span></button></div><p class="gesture-hint">左右滑动卡片，也能切换单词</p></div>`;
  }

  function renderQuiz(lesson) {
    if (state.quizStep === 0) {
      const options = core.listeningOptions(lesson.words, lesson.number);
      screen.innerHTML = `<div class="quiz-page">${header('听音选词', `#/lesson/${encodeURIComponent(lesson.id)}`)}<div class="quiz-intro"><span class="chapter-pill">第 1 题 / 2 题</span><h1 tabindex="-1">听到了哪个单词？</h1><p>点喇叭听一听，再选出正确的词</p></div>
        <button class="big-speaker" data-action="play" data-word="${esc(lesson.words[0].word)}" aria-label="播放题目单词"><span aria-hidden="true">🔊</span><small>点我听发音</small></button><div class="choice-list">${options.map(word => `<button data-action="choose" data-word="${esc(word)}" class="choice ${state.listenCorrect && word === lesson.words[0].word ? 'correct' : ''}"><span class="choice-icon" aria-hidden="true">✦</span><strong>${esc(word)}</strong><span aria-hidden="true">→</span></button>`).join('')}</div>
        <p class="quiz-feedback" role="status">${esc(state.feedback || '不着急，可以多听几次。')}</p>${state.listenCorrect ? '<button class="primary-button quiz-next" data-action="next-quiz">下一题 →</button>' : ''}</div>`;
      return;
    }
    const word = lesson.words[1];
    const tiles = core.spellingTiles(word);
    screen.innerHTML = `<div class="quiz-page">${header('拼一拼', `#/lesson/${encodeURIComponent(lesson.id)}`)}<div class="quiz-intro"><span class="chapter-pill">第 2 题 / 2 题</span><h1 tabindex="-1">把声音拼成单词</h1><p>听发音，按顺序点下面的字母块</p></div>
      <button class="big-speaker small-speaker" data-action="play" data-word="${esc(word.word)}" aria-label="播放题目单词"><span aria-hidden="true">🔊</span><small>${esc(word.meaning)}</small></button><div class="spelling-slots" aria-label="已选择 ${esc(state.selectedChunks.map(index => word.chunks[index]).join('，'))}">${word.chunks.map((_, index) => `<span>${state.selectedChunks[index] === undefined ? '?' : esc(word.chunks[state.selectedChunks[index]])}</span>`).join('')}</div>
      <div class="tile-list">${tiles.map(tile => `<button data-action="spell" data-index="${tile.index}" ${state.selectedChunks.includes(tile.index) || state.spellingCorrect ? 'disabled' : ''}>${esc(tile.chunk)}</button>`).join('')}</div><p class="quiz-feedback" role="status">${esc(state.feedback || '可以先点喇叭，再试着拼出来。')}</p><div class="quiz-actions"><button class="secondary-button" data-action="clear-spell" ${state.spellingCorrect ? 'disabled' : ''}>重试</button>${state.spellingCorrect ? '<button class="primary-button" data-action="finish">领取星星 →</button>' : ''}</div></div>`;
  }

  function renderResult(lesson) {
    const score = state.progress.completed[lesson.id] || 1;
    const next = state.lessons[lessonIndex(lesson.id) + 1];
    screen.innerHTML = `<div class="result-page"><div class="confetti" aria-hidden="true">✦　·　✦　·　✦</div><img class="result-mascot" src="./icons/explorer-penguin.webp" alt=""><p class="eyebrow">LEVEL COMPLETE!</p><h1 tabindex="-1">第 ${lesson.number} 关完成！</h1><p>你已经会读 <strong>${esc(lesson.pattern)}</strong> 了</p><div class="result-stars" aria-label="${score} 颗星">${'★'.repeat(score)}<span>${'★'.repeat(3 - score)}</span></div><p class="result-note">${score === 3 ? '太棒啦，三颗星都收集到了！' : '认真练习就是最棒的探险！'}</p><div class="result-buttons"><a class="primary-button" href="${next ? `#/lesson/${encodeURIComponent(next.id)}` : '#/map'}">${next ? '继续探险' : '查看地图'} →</a><button class="secondary-button" data-action="restart">再玩一次</button></div></div>`;
  }

  function route() {
    window.KidsAudio.stop();
    const [, page = 'home', encodedId] = (location.hash || '#/home').split('/');
    let id = null;
    try { id = encodedId ? decodeURIComponent(encodedId) : null; } catch { /* Invalid hash falls back to map. */ }
    const lesson = id ? lessonById(id) : null;
    if (page === 'home') renderHome();
    else if (page === 'map') renderMap();
    else if (page === 'library') renderLibrary();
    else if (page === 'rule' && lesson) renderRule(lesson);
    else if (lesson && core.isUnlocked(lessonIndex(id), state.lessons, state.progress)) {
      if (state.lessonId !== id) {
        state.lessonId = id;
        state.wordIndex = 0;
        state.quizStep = 0;
        state.mistakes = 0;
        state.listenCorrect = false;
        state.selectedChunks = [];
        state.spellingCorrect = false;
        state.feedback = '';
      }
      if (page === 'lesson') renderLesson(lesson);
      else if (page === 'quiz') renderQuiz(lesson);
      else if (page === 'result' && state.progress.completed[id]) renderResult(lesson);
      else renderMap();
    } else renderMap();
    window.scrollTo(0, 0);
    if (page !== 'home') screen.querySelector('h1[tabindex="-1"]')?.focus({ preventScroll: true });
  }

  screen.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    const lesson = lessonById(state.lessonId);
    if (action === 'open-level') {
      state.lessonId = null;
      location.hash = `#/lesson/${encodeURIComponent(button.dataset.id)}`;
    } else if (action === 'open-island') {
      state.openIslandId = button.dataset.id;
      renderMap();
    } else if (action === 'close-island') {
      const islandId = state.openIslandId;
      state.openIslandId = null;
      renderMap();
      screen.querySelector(`[data-action="open-island"][data-id="${islandId}"]`)?.focus({ preventScroll: true });
    } else if (action === 'restart' && lesson) {
      state.lessonId = null;
      location.hash = `#/lesson/${encodeURIComponent(lesson.id)}`;
    } else if (action === 'play') {
      window.KidsAudio.playWord(button.dataset.word, notify);
    } else if (action === 'prev-word' && lesson) {
      state.wordIndex = Math.max(0, state.wordIndex - 1);
      renderLesson(lesson);
    } else if (action === 'next-word' && lesson) {
      if (state.wordIndex < lesson.words.length - 1) {
        state.wordIndex++;
        renderLesson(lesson);
      } else {
        state.quizStep = 0;
        state.mistakes = 0;
        state.listenCorrect = false;
        state.selectedChunks = [];
        state.spellingCorrect = false;
        state.feedback = '';
        location.hash = `#/quiz/${encodeURIComponent(lesson.id)}`;
      }
    } else if (action === 'choose' && lesson && !state.listenCorrect) {
      if (button.dataset.word === lesson.words[0].word) {
        state.listenCorrect = true;
        state.feedback = '答对了！这个词是 ' + lesson.words[0].word;
      } else {
        state.mistakes++;
        state.feedback = '再听一次，注意开头的声音。';
      }
      renderQuiz(lesson);
    } else if (action === 'next-quiz' && lesson) {
      state.quizStep = 1;
      state.feedback = '';
      renderQuiz(lesson);
    } else if (action === 'spell' && lesson && !state.spellingCorrect) {
      const word = lesson.words[1];
      state.selectedChunks.push(Number(button.dataset.index));
      if (state.selectedChunks.length === word.chunks.length) {
        state.spellingCorrect = core.checkSpelling(word, state.selectedChunks);
        if (!state.spellingCorrect) state.mistakes++;
        state.feedback = state.spellingCorrect ? `拼对了！${word.word}，${word.meaning}` : '差一点，再换个顺序试试。';
      }
      renderQuiz(lesson);
    } else if (action === 'clear-spell' && lesson) {
      state.selectedChunks = [];
      state.feedback = '';
      renderQuiz(lesson);
    } else if (action === 'finish' && lesson && state.spellingCorrect) {
      state.progress = core.recordCompletion(state.progress, lesson.id, core.starsForMistakes(state.mistakes));
      saveProgress();
      location.hash = `#/result/${encodeURIComponent(lesson.id)}`;
    }
  });

  screen.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.openIslandId) {
      event.preventDefault();
      const islandId = state.openIslandId;
      state.openIslandId = null;
      renderMap();
      screen.querySelector(`[data-action="open-island"][data-id="${islandId}"]`)?.focus({ preventScroll: true });
    }
  });

  let touchStart = null;
  screen.addEventListener('touchstart', event => {
    if (event.target.closest('.word-card')) touchStart = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
  }, { passive: true });
  screen.addEventListener('touchend', event => {
    if (!touchStart || !location.hash.startsWith('#/lesson/')) return;
    const dx = event.changedTouches[0].clientX - touchStart[0];
    const dy = event.changedTouches[0].clientY - touchStart[1];
    touchStart = null;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const lesson = lessonById(state.lessonId);
    state.wordIndex = Math.max(0, Math.min(lesson.words.length - 1, state.wordIndex + (dx < 0 ? 1 : -1)));
    renderLesson(lesson);
  }, { passive: true });

  async function init() {
    try {
      const response = await fetch('./data/kids-lessons.json?v=15');
      if (!response.ok) throw new Error('lesson data unavailable');
      const data = await response.json();
      state.islands = data.islands;
      state.lessons = data.lessons;
      let saved = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* Private mode may block storage. */ }
      state.progress = core.readProgress(saved, state.lessons);
      window.addEventListener('hashchange', route);
      route();
    } catch {
      screen.innerHTML = '<div class="error-page"><h1>地图还没准备好</h1><p>请检查网络后重试。</p><button class="primary-button" onclick="location.reload()">重新加载</button></div>';
    }
  }
  init();
})();
