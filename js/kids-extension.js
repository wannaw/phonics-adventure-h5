(function () {
  const { pictureUnits } = window.KidsExtensionData;
  const categories = pictureUnits.flatMap(unit => unit.categories.map(category => ({ ...category, unit })));
  const pictureLink = (id, word) => `#/picture-words/${encodeURIComponent(id)}${word ? '/' + encodeURIComponent(word) : ''}`;
  const unavailable = '原版发音未导入';
  const audioExtensions = /\.(?:mp3|wav|ogg|opus|m4a|aac|flac|webm)$/i;
  const imageExtensions = /\.(?:webp|png|jpe?g|gif|avif)$/i;

  // Snapshot paths point to bundled files next to index.html.
  function localAsset(value, extensions) {
    if (typeof value !== 'string') return '';
    const path = value.replace(/^\.\//, '');
    const safeSegments = /^(?:[\p{L}\p{N}_-][\p{L}\p{N}_. -]*\/)*[\p{L}\p{N}_-][\p{L}\p{N}_. -]*$/u;
    return safeSegments.test(path) && extensions.test(path)
      ? './' + path.split('/').map(encodeURIComponent).join('/') : '';
  }

  const wordAudio = word => localAsset(word.audio, audioExtensions);
  const sourceNumber = category => category.sourceId;


  document.addEventListener('click', event => {
    const button = event.target.closest('.picture-page button[data-picture-audio]');
    const source = button && !button.disabled && localAsset(button.dataset.pictureAudio, audioExtensions);
    if (!source) return;
    const status = button.parentElement.querySelector('[role="status"]');
    status.textContent = '';
    window.KidsAudio.playCourseMedia(source, () => {
      status.textContent = '原版发音暂时无法播放';
    });
  });

  document.addEventListener('error', event => {
    const image = event.target;
    if (!image.matches?.('.picture-page .picture-image')) return;
    image.hidden = true;
    image.nextElementSibling.hidden = false;
  }, true);

  function artwork(item, className, esc, sourceId) {
    const image = localAsset(item.image, imageExtensions);
    const icon = `<span${image ? ' hidden' : ''}>${esc(item.icon || '✦')}</span>`;
    const source = image ? `<img class="picture-image" src="${esc(image)}" alt="" decoding="async">` : sourceId ? `<img class="picture-image" data-picture-category-id="${sourceId}" alt="" loading="lazy" decoding="async">` : '';
    return `<span class="${className}" aria-hidden="true">${source}${icon}</span>`;
  }

  function audioControl(label, path, esc) {
    if (!path) return `<button type="button" class="picture-audio" disabled>${label} · ${unavailable}</button>`;
    // Decode the validated segments for the click handler to validate again.
    return `<div class="picture-audio-group"><button type="button" class="picture-audio" data-picture-audio="${esc(decodeURIComponent(path))}"><span aria-hidden="true">▶</span> ${label}</button><p class="picture-audio-status" role="status"></p></div>`;
  }

  function renderIndex(id, esc) {
    const openUnit = pictureUnits.find(unit => unit.id === id) || pictureUnits[0];
    const units = pictureUnits.map(unit => `<details class="extension-group picture-unit" name="picture-units"${unit === openUnit ? ' open' : ''}>
      <summary>${esc(unit.title)}</summary>
      <div class="extension-picture-grid picture-category-grid">${unit.categories.map(entry => `<a class="picture-category" href="${pictureLink(entry.id)}">
        ${artwork(entry, 'picture-category-art', esc, sourceNumber(entry))}<strong>${esc(entry.title)}</strong>${entry.words == null ? '<small>待核对</small>' : ''}
      </a>`).join('')}</div>
    </details>`).join('');
    return `<section class="picture-banner" aria-labelledby="picture-index-title">
      <div><h1 id="picture-index-title" tabindex="-1">看图识词</h1><p>跟着企鹅，用图片记单词。</p></div>
      <img src="./icons/explorer-penguin.webp" alt="" width="112" height="112">
    </section>
    <section class="picture-index" aria-labelledby="picture-units-title">
      <h2 id="picture-units-title">单元分类</h2>
      <p class="picture-availability">${pictureUnits.length} 个单元 · ${categories.filter(item => item.words?.length).length} 个分类已导入词卡</p>
      <div class="picture-units">${units}</div>
    </section>`;
  }

  function renderCategory(category, unitLink, esc) {
    const words = category.words;
    let content;
    if (!words?.length) {
      const status = words == null ? '这个分类的原版词卡还在核对。' : '原版当前未显示词卡。';
      content = `<p class="picture-empty">${status}</p><p class="picture-availability">${unavailable}</p>`;
    } else {
      const hasAudio = words.some(wordAudio);
      content = `<p class="picture-availability">${hasAudio ? '点开词卡查看发音状态' : unavailable}</p>
        <div class="extension-picture-grid picture-card-grid" aria-label="词卡列表">
          ${words.map(entry => `<a class="extension-chip picture-card" href="${pictureLink(category.id, entry.word)}">
            ${artwork(entry, 'picture-card-art', esc)}<strong lang="en">${esc(entry.word)}</strong>
            ${hasAudio && !wordAudio(entry) ? `<small>${unavailable}</small>` : ''}
          </a>`).join('')}
        </div>`;
    }
    return `<section class="picture-heading"><p>${esc(category.unit.title)}</p><h1 tabindex="-1">${esc(category.title)}</h1></section>
      ${content}<footer class="picture-footer"><a class="secondary-button" href="${unitLink}">← 返回单元分类</a></footer>`;
  }

  function renderWord(category, index, esc) {
    const { words } = category;
    const word = words[index];
    const wordLink = entry => pictureLink(category.id, entry.word);
    const previous = words[index - 1];
    const next = words[index + 1];
    const neighbors = words.slice(Math.max(0, index - 2), index + 3);
    const example = word.sentence ? `<section class="picture-example"><h2>例句</h2><p lang="en">${esc(word.sentence)}</p>
      ${audioControl('听例句', localAsset(word.sentenceAudio, audioExtensions), esc)}</section>` : '';
    return `<div class="picture-heading picture-context"><p>${esc(category.unit.title)}</p><a href="${pictureLink(category.id)}">${esc(category.title)}</a></div>
      <nav class="picture-strip" aria-label="跳转到附近词卡">
        ${neighbors.map(entry => `<a href="${wordLink(entry)}"${entry === word ? ' aria-current="page"' : ''}>
          ${artwork(entry, 'picture-strip-art', esc)}<span lang="en">${esc(entry.word)}</span>
        </a>`).join('')}
      </nav>
      <section class="picture-word">
        ${artwork(word, 'picture-word-art', esc)}
        <h1 lang="en" tabindex="-1">${esc(word.word)}</h1><p class="picture-meaning">${esc(word.meaning)}</p>
        ${audioControl('听单词', wordAudio(word), esc)}
      </section>
      ${example}
      <nav class="extension-pagination picture-pagination" aria-label="切换词卡">
        ${previous ? `<a href="${wordLink(previous)}">← 上一词</a>` : '<span aria-disabled="true">← 上一词</span>'}
        <span class="picture-position">${index + 1} / ${words.length}</span>
        ${next ? `<a href="${wordLink(next)}">下一词 →</a>` : '<span aria-disabled="true">下一词 →</span>'}
      </nav>`;
  }

  function render(page, id, wordId, { header, nav, esc }) {
    if (page !== 'extension' && page !== 'picture-words') return null;

    const wrapper = (variant, title, back, content) => `<div class="extension-page ${variant} page-with-nav">${header(title, back)}${content}${nav('extension')}</div>`;
    if (page === 'extension') {
      const modules = [
        ['#/picture-words', '🍎', '看图识词'],
        ['#/ipa', '🎧', '英语音标'],
        ['#/phonics', '🔤', '自然拼读']
      ];
      return wrapper('extension-landing', '拓展学习', '#/home', `<h1 class="sr-only" tabindex="-1">拓展学习</h1>
        <div class="extension-links">${modules.map(([url, icon, title]) => `<a class="extension-link" href="${url}"><span class="extension-icon" aria-hidden="true">${icon}</span><strong>${title}</strong></a>`).join('')}</div>`);
    }

    const category = categories.find(entry => entry.id === id);
    if (!category) return wrapper('picture-page', '看图识词', '#/extension', renderIndex(id, esc));
    const unitLink = category.unit === pictureUnits[0] ? '#/picture-words' : pictureLink(category.unit.id);
    const index = category.words?.findIndex(entry => entry.word === wordId) ?? -1;
    if (index < 0) return wrapper('picture-page', '看图识词', unitLink, renderCategory(category, unitLink, esc));
    return wrapper('picture-page', '看图识词', pictureLink(category.id), renderWord(category, index, esc));
  }

  window.KidsExtension = { render };
})();
