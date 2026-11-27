(function () {
  const source = window.KidsSoundCourses;
  const ipaItems = source.ipa.flatMap(group => group.sections.flatMap(section => section.rows.flatMap(row => row.items.map(item => ({ ...item, group, section, row })))));
  const letters = source.phonics.flatMap(group => group.letters.map(letter => ({ ...letter, group })));
  const normal = value => value.replaceAll(':', 'ː').replaceAll('g', 'ɡ').replace(/[\[\]/]/g, '');
  const ipaUrl = id => `#/ipa/${id}`;
  const phonicsUrl = (letter, id, tab = 'mouth') => `#/phonics/${letter}/${id}/${tab}`;
  const tabs = [['mouth', '口型'], ['words', '例词'], ['sentences', '例句']];

  function render(page, id, soundId, tab, ui) {
    if (page !== 'ipa' && page !== 'phonics') return null;
    const { header, nav, esc, lessons } = ui;
    const wrap = (title, back, content) => `<div class="sounds-page extension-page page-with-nav">${header(title, back)}${content}${nav('extension')}</div>`;
    const hero = (title, subtitle) => `<section class="extension-hero"><h1 tabindex="-1">${esc(title)}</h1><p>${esc(subtitle)}</p></section>`;
    const chip = (href, name, selected = false) => `<a class="sound-chip" href="${href}" ${selected ? 'aria-current="page"' : ''}>${esc(name)}</a>`;
    const mediaScope = (kind, id, content) => `<div data-sound-course="${kind}" data-source-id="${id}">${content}</div>`;
    const sourceLink = '<p class="audio-credits-link"><a href="./audio-credits.html">课程与发音来源</a></p>';
    const status = `<p class="sound-status" role="status">正在加载原版媒体…</p>`;
    const video = `<div class="sound-media" data-course-video hidden><video controls playsinline preload="none" aria-label="发音示范视频"></video></div>`;
    const play = (key, description, fallback = '', buttonClass = 'rule-play', text = '🔊') => `<button class="${buttonClass}" data-action="course-audio" data-media="${key}" data-fallback="${esc(fallback)}" aria-label="${esc(description)}">${text}</button>`;
    const mediaList = (items, make, dynamic = false) => items.length ? `<ul class="sound-list" ${dynamic ? 'data-course-examples' : ''}>${items.map(make).join('')}</ul>` : '<p class="sound-status">原版此处没有条目。</p>';
    const marked = (text, { startIndex: start, endIndex: end }) => Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end >= start && end < text.length
      ? `${esc(text.slice(0, start))}<mark>${esc(text.slice(start, end + 1))}</mark>${esc(text.slice(end + 1))}`
      : esc(text);
    const relatedRules = predicate => {
      const links = lessons.filter(predicate).map(lesson => `<a class="secondary-button" href="#/rule/${encodeURIComponent(lesson.id)}">${esc(lesson.pattern)}</a>`).join('');
      return links ? `<div class="sound-actions" aria-label="相关拼读规则">${links}</div>` : '';
    };

    function ipaTable(group, active) {
      return `<div class="sound-table">${group.sections.map(section => `<section><h2>${esc(section.name)}</h2>${section.rows.map(row => `<div class="sound-table-row">${row.name && row.name !== section.name ? `<h3>${esc(row.name)}</h3>` : ''}<div class="sound-chip-grid">${row.items.map(item => chip(ipaUrl(item.id), item.symbol, item.id === active)).join('')}</div></div>`).join('')}</section>`).join('')}</div>`;
    }

    if (page === 'ipa') {
      const fallback = window.KidsExtensionData.ipa.find(item => item.id === id);
      const item = ipaItems.find(item => item.id === Number(id) || (fallback && normal(item.symbol) === fallback.symbol));
      const group = item?.group || source.ipa[id === 'consonants' ? 1 : 0];
      const back = group.id === source.ipa[0].id ? '#/ipa' : '#/ipa/consonants';
      if (!item) {
        const links = source.ipa.map((entry, index) => chip(index ? '#/ipa/consonants' : '#/ipa', entry.name, entry === group)).join('');
        return wrap('英语音标', '#/extension', `${hero('48 个英语国际音标', '按元音、辅音查找音标。')}<nav class="sound-tabs" aria-label="音标分类">${links}</nav>${ipaTable(group)}`);
      }

      const detail = source.ipaDetails[item.id];
      const local = window.KidsExtensionData.ipa.find(entry => entry.symbol === normal(item.symbol));
      const examples = mediaList(detail.examples, entry => `<li><div><strong lang="en">${marked(entry.word, entry)}</strong><small>${esc(entry.ipa)} ${esc(entry.translation)}</small></div>${play(`example-${entry.id}`, `播放 ${entry.word}`, entry.word)}</li>`, true);
      const pagination = `<nav class="extension-pagination" aria-label="切换音标">${detail.previous ? `<a href="${ipaUrl(detail.previous.id)}">← 上一个 ${esc(detail.previous.symbol)}</a>` : ''}${detail.next ? `<a href="${ipaUrl(detail.next.id)}">下一个 ${esc(detail.next.symbol)} →</a>` : ''}</nav>`;
      const selector = `<details class="sound-switcher"><summary>打开音标表</summary>${source.ipa.map(entry => ipaTable(entry, item.id)).join('')}</details>`;
      const actions = `<div class="sound-actions">${play('main', '听音标', local?.id, 'primary-button', '听音标')}<a class="secondary-button" href="#/phonics">自然拼读</a></div>`;
      return wrap('英语音标', back, `${hero(`/${item.symbol}/`, [...new Set([group.name, item.section.name, item.row.name])].filter(Boolean).join(' · '))}${mediaScope('ipa', item.id, `<section class="sound-detail">${video}${actions}${status}<h2>发音要领</h2>${detail.mnemonic ? `<p>${esc(detail.mnemonic)}</p>` : ''}<p>${esc(detail.cue)}</p><h2>例词</h2>${examples}${relatedRules(lesson => lesson.ipa.split(' or ').some(value => normal(value) === normal(item.symbol)))}</section>`)}${pagination}${selector}${sourceLink}`);
    }

    function letterGroups(active) {
      return `<div class="sound-table">${source.phonics.map(group => `<section><h2>${esc(group.name)}</h2><div class="sound-chip-grid letter-grid">${group.letters.map(letter => chip(`#/phonics/${letter.id}`, letter.letter, letter.id === active)).join('')}</div></section>`).join('')}</div>`;
    }

    const letter = letters.find(item => item.id === Number(id));
    if (!letter) return wrap('自然拼读', '#/extension', `${hero('自然拼读', '选择字母或字母组合，学习它的不同发音。')}${letterGroups()}<div class="sound-actions"><a class="secondary-button" href="#/library">查看探险岛规则库</a></div>`);

    const sound = letter.symbols.find(item => item.id === Number(soundId)) || letter.symbols[0];
    const activeTab = tabs.some(([key]) => key === tab) ? tab : 'mouth';
    const selector = `<details class="sound-switcher"><summary>展开字母表</summary>${letterGroups(letter.id)}</details>`;
    if (!sound) return wrap('自然拼读', '#/phonics', `${hero(letter.letter, letter.group.name)}<p class="sound-status">原版暂未提供发音内容。</p>${selector}`);
    const detail = source.phonicsDetails[sound.id];
    const neighbours = `<nav class="sound-tabs" aria-label="同组字母">${letter.group.letters.map(item => chip(`#/phonics/${item.id}`, item.letter, item.id === letter.id)).join('')}</nav>`;
    const pronunciations = `<nav class="sound-tabs" aria-label="选择发音">${letter.symbols.map(item => chip(phonicsUrl(letter.id, item.id, activeTab), item.symbol, item.id === sound.id)).join('')}</nav>`;
    const lessonTabs = `<nav class="sound-tabs" aria-label="发音内容">${tabs.map(([key, label]) => chip(phonicsUrl(letter.id, sound.id, key), label, key === activeTab)).join('')}</nav>`;
    const local = window.KidsExtensionData.ipa.find(entry => entry.symbol === normal(sound.symbol.replace('[ei]', '[eɪ]')));
    let content = `<h2>发音方法</h2><img class="sound-media" data-course-mouth hidden alt="发音口型示范"><button class="secondary-button" data-action="course-replay" hidden>重播口型</button><ol>${detail.mouth.map(text => `<li>${esc(text)}</li>`).join('')}</ol>`;
    if (activeTab === 'words') content = `<h2>例词</h2>${mediaList(detail.words, entry => `<li><div><strong lang="en">${marked(entry.word, entry)}</strong><small>${esc(entry.ipa)} ${esc(entry.translation)}</small></div>${play(`word-${entry.id}`, `播放例词 ${entry.text}`, entry.word || entry.text.split(/[\s[]/)[0])}</li>`)}`;
    if (activeTab === 'sentences') content = `<h2>例句</h2>${mediaList(detail.sentences, entry => `<li><div><strong lang="en">${marked(entry.text, entry)}</strong><small>${esc(entry.translation)}</small></div>${play(`sentence-${entry.id}`, '播放例句', entry.text)}</li>`)}`;
    const action = play('main', '听发音', local?.id, 'primary-button', '听发音');
    return wrap('自然拼读', '#/phonics', `${hero(`${letter.letter} ${sound.symbol}`, letter.group.name)}${neighbours}${pronunciations}${lessonTabs}${mediaScope('phonics', sound.id, `<section class="sound-detail"><div class="sound-actions">${action}</div>${status}${content}</section>`)}${relatedRules(lesson => lesson.pattern === letter.letter)}${selector}${sourceLink}`);
  }

  window.KidsSounds = { render };
})();
