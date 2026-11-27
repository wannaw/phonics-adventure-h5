(function () {
  const api = 'https://api.beijinxuetang.com/api/';
  let current = null;

  function publicMedia(value) {
    try {
      const url = new URL(value);
      if (url.origin === 'https://cdn.beijinxuetang.com' && url.pathname.startsWith('/static/')) return url.href;
    } catch { /* The source has no media for this field. */ }
    return '';
  }

  function updateExamples(scope, items) {
    const list = scope.querySelector('[data-course-examples]');
    if (!list || !items?.length || list.contains(document.activeElement)) return;
    const rows = items.map(item => {
      const row = document.createElement('li');
      const labels = document.createElement('div');
      const word = document.createElement('strong');
      word.lang = 'en';
      const start = item.start_index;
      const end = item.end_index;
      if (Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end >= start && end < item.word.length) {
        const mark = document.createElement('mark');
        mark.textContent = item.word.slice(start, end + 1);
        word.append(item.word.slice(0, start), mark, item.word.slice(end + 1));
      } else word.textContent = item.word;
      const hint = document.createElement('small');
      hint.textContent = `${item.word_symbol || ''} ${item.translation || ''}`.trim();
      labels.append(word, hint);
      const button = document.createElement('button');
      button.className = 'rule-play';
      button.dataset.action = 'course-audio';
      button.dataset.media = `example-${item.id}`;
      button.dataset.fallback = item.word;
      button.setAttribute('aria-label', `播放 ${item.word}`);
      button.textContent = '🔊';
      row.append(labels, button);
      return row;
    });
    list.replaceChildren(...rows);
  }

  async function load(session) {
    const { scope, kind, id, controller } = session;
    const endpoint = kind === 'ipa' ? `yinbiao/detail?symbol_id=${id}` : `zrpd/content?yinbiao_id=${id}`;
    const status = scope.querySelector('.sound-status');
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(api + endpoint, { signal: controller.signal, credentials: 'omit', cache: 'no-store' });
      if (!response.ok) throw new Error('Source media unavailable');
      const { code, data } = await response.json();
      const entry = (kind === 'ipa' ? data?.detail : data?.content)?.[0];
      if (code !== 0 || !entry || Number(entry.id) !== id) throw new Error('Source media unavailable');
      if (current !== session) return;
      session.audio.set('main', publicMedia(kind === 'ipa' ? entry.audio : entry.sound));
      for (const item of entry.symbol_word || []) session.audio.set(`example-${item.id}`, publicMedia(item.audio));
      if (kind === 'ipa' && !session.request) updateExamples(scope, entry.symbol_word);
      for (const item of entry.word || []) session.audio.set(`word-${item.id}`, publicMedia(item.sound));
      for (const item of entry.sentence || []) session.audio.set(`sentence-${item.id}`, publicMedia(item.sound_man) || publicMedia(item.sound_woman));
      const video = scope.querySelector('[data-course-video]');
      const clip = publicMedia(entry.mp4);
      if (video && clip) {
        const player = video.querySelector('video');
        player.src = clip;
        video.hidden = false;
        player.addEventListener('play', () => window.KidsAudio.stop());
        player.addEventListener('error', () => { video.hidden = true; status.textContent = '原版视频暂时无法播放。'; });
      }
      const image = scope.querySelector('[data-course-mouth]');
      const animation = publicMedia(entry.image);
      if (image && animation) {
        const button = scope.querySelector('[data-action="course-replay"]');
        image.addEventListener('error', () => { image.hidden = true; button.hidden = true; status.textContent = '原版口型动图暂时无法加载。'; });
        button.hidden = false;
        image.src = animation;
        image.hidden = false;
      }
      status.textContent = '';
    } catch {
      if (current === session) status.textContent = '原版媒体暂时无法连接，仍可查看课程内容。';
    } finally {
      clearTimeout(timeout);
    }
  }

  function attach(screen) {
    if (current) {
      current.controller.abort();
      current.scope.querySelector('video')?.pause();
      current = null;
    }
    const scope = screen.querySelector('[data-sound-course]');
    if (!scope) return;
    const session = { scope, kind: scope.dataset.soundCourse, id: Number(scope.dataset.sourceId), controller: new AbortController(), audio: new Map() };
    current = session;
    session.pending = load(session);
  }

  async function play(button, notify) {
    const session = current;
    if (!session || !session.scope.contains(button)) return;
    session.request = button;
    session.scope.querySelector('video')?.pause();
    const key = button.dataset.media;
    if (session.pending) await session.pending;
    if (current !== session || session.request !== button) return;
    const fallback = () => {
      const text = button.dataset.fallback;
      if (!text) { notify('暂时无法播放这段发音'); return; }
      if (key !== 'main') { window.KidsAudio.playSpeech(text, notify, 'en-GB'); return; }
      const item = window.KidsExtensionData.ipa.find(entry => entry.id === text);
      if (item?.pattern) window.KidsAudio.playPhoneme(item.pattern, item.variant || 0, notify);
      else if (item) window.KidsAudio.playIpa(item.id, notify);
    };
    const url = session.audio.get(key);
    if (url) window.KidsAudio.playCourseMedia(url, fallback);
    else fallback();
  }

  function replay(button) {
    const session = current;
    const image = session?.scope.querySelector('[data-course-mouth]');
    if (!image || !session.scope.contains(button)) return;
    const url = image.getAttribute('src');
    if (!url) return;
    image.removeAttribute('src');
    requestAnimationFrame(() => { if (session === current) image.src = url; });
  }

  window.KidsSoundMedia = { attach, play, replay };
})();
