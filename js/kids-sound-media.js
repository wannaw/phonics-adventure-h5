(function () {
  const api = 'https://api.beijinxuetang.com/api/';
  let current = null;

  function publicMedia(value) {
    try {
      const url = new URL(value);
      if (url.origin === 'https://cdn.beijinxuetang.com' && ['/static/', '/pindu/', '/uploads/wordEnglish/image/'].some(prefix => url.pathname.startsWith(prefix))) return url.href;
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
      button.disabled = !publicMedia(item.audio);
      button.setAttribute('aria-label', `播放 ${item.word}`);
      button.textContent = '🔊';
      row.append(labels, button);
      return row;
    });
    list.replaceChildren(...rows);
  }

  function attachVideo(panel, url, status, poster) {
    if (!panel || !url) return;
    const player = panel.querySelector('video');
    player.addEventListener('play', () => window.KidsAudio.stop());
    player.addEventListener('error', () => { panel.hidden = true; status.textContent = '原版视频暂时无法播放。'; });
    if (poster) player.poster = poster;
    player.src = url;
    panel.hidden = false;
  }

  async function loadLetterVideo(session, status) {
    const panel = session.scope.querySelector('[data-course-letter-video]');
    if (!panel) return;
    try {
      const response = await fetch(api + 'zrpd/index', { signal: session.controller.signal, credentials: 'omit', cache: 'no-store' });
      const { data } = response.ok ? await response.json() : {};
      const letter = data?.list.flatMap(group => group.letter).find(entry => String(entry.id) === session.scope.dataset.letterId);
      if (current !== session || !letter) return;
      attachVideo(panel, publicMedia(letter.video_path), status, publicMedia(letter.video_cover));
    } catch { /* The pronunciation content is usable without the supplementary video. */ }
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
      if (kind === 'ipa') updateExamples(scope, entry.symbol_word);
      for (const item of entry.word || []) {
        session.audio.set(`word-${item.id}`, publicMedia(item.sound));
        const image = scope.querySelector(`[data-course-word-image="${Number(item.id)}"]`);
        const url = publicMedia(item.image);
        if (image && url) {
          image.addEventListener('error', () => { image.hidden = true; });
          image.src = url;
          image.hidden = false;
        }
      }
      for (const item of entry.sentence || []) {
        session.audio.set(`sentence-${item.id}-male`, publicMedia(item.sound_man));
        session.audio.set(`sentence-${item.id}-female`, publicMedia(item.sound_woman));
        session.audio.set(`sentence-${item.id}`, publicMedia(item.sound_man) || publicMedia(item.sound_woman));
      }
      attachVideo(scope.querySelector('[data-course-video]'), publicMedia(entry.mp4), status);
      const image = scope.querySelector('[data-course-mouth]');
      const animation = publicMedia(entry.image);
      if (image && animation) {
        const button = scope.querySelector('[data-action="course-replay"]');
        image.addEventListener('error', () => { image.hidden = true; button.hidden = true; status.textContent = '原版口型动图暂时无法加载。'; });
        button.hidden = false;
        image.src = animation;
        image.hidden = false;
      }
      for (const button of scope.querySelectorAll('button[data-action="course-audio"]')) {
        button.disabled = !session.audio.get(button.dataset.media);
        if (button.disabled) button.title = '原版录音暂不可用';
      }
      status.textContent = session.audio.get('main') ? '音源：倍进学堂原版' : '原版发音暂时无法加载。';
    } catch {
      if (current === session) status.textContent = '原版媒体暂时无法连接，仍可查看课程内容。';
    } finally {
      clearTimeout(timeout);
    }
  }

  let categoryImages;

  async function attachPictureCategories(screen) {
    const images = [...screen.querySelectorAll('[data-picture-category-id]')];
    if (!images.length || !navigator.onLine) return;
    if (!categoryImages) {
      categoryImages = fetch(api + 'kantu/unitList', { credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(8000) }).then(async response => {
        const result = response.ok ? await response.json() : {};
        if (result.code !== 0 || !Array.isArray(result.data?.list)) throw new Error('Category images unavailable');
        return new Map(result.data.list.flatMap(unit => unit.category.map(category => [String(category.id), publicMedia(category.image)])));
      });
      const request = categoryImages;
      setTimeout(() => { if (categoryImages === request) categoryImages = null; }, 300000);
    }
    try {
      const sources = await categoryImages;
      for (const image of images) {
        const url = sources.get(image.dataset.pictureCategoryId);
        if (!image.isConnected || !url) continue;
        image.addEventListener('load', () => { image.classList.add('is-loaded'); image.nextElementSibling.hidden = true; }, { once: true });
        image.src = url;
      }
    } catch { categoryImages = null; }
  }

  function attach(screen) {
    if (current) {
      current.controller.abort();
      for (const video of current.scope.querySelectorAll('video')) video.pause();
      current = null;
    }
    attachPictureCategories(screen);
    const scope = screen.querySelector('[data-sound-course]');
    if (!scope) return;
    const session = { scope, kind: scope.dataset.soundCourse, id: Number(scope.dataset.sourceId), controller: new AbortController(), audio: new Map() };
    current = session;
    for (const button of scope.querySelectorAll('button[data-action="course-audio"]')) button.disabled = true;
    load(session);
    loadLetterVideo(session, scope.querySelector('.sound-status'));
  }

  function play(button, notify) {
    const session = current;
    const url = session?.audio.get(button.dataset.media);
    if (!url || !session.scope.contains(button)) return;
    for (const player of session.scope.querySelectorAll('video')) player.pause();
    window.KidsAudio.playCourseMedia(url, () => {
      const message = '原版录音暂时无法播放，请联网后重试。';
      session.scope.querySelector('.sound-status').textContent = message;
      notify(message);
    });
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
