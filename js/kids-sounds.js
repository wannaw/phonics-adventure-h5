(function () {
  const source = window.KidsSoundCourses;
  const ipaItems = source.ipa.flatMap(group => group.sections.flatMap(section => section.rows.flatMap(row => row.items.map(item => ({ ...item, group, section, row })))));
  const letters = source.phonics.flatMap(group => group.letters.map(letter => ({ ...letter, group })));
  const normal = value => value.replaceAll(':', 'ː').replaceAll('g', 'ɡ').replace(/\[|\]|\//g, '');
  const ipaUrl = id => `#/ipa/${id}`;
  const phonicsUrl = (letter, id, tab = 'mouth') => `#/phonics/${letter}/${id}/${tab}`;
  const tabs = [['mouth', '口型'], ['words', '例词'], ['sentences', '例句']];

  function render(page, id, soundId, tab, ui) {
    if (page !== 'ipa' && page !== 'phonics') return null;
    const { header, nav, esc, lessons } = ui;
    const wrap = (title, back, content) => `<div class="sounds-page extension-page page-with-nav">${header(title, back)}<div class="sounds-content">${content}</div>${nav('extension')}</div>`;
    const band = (title, subtitle, mascot = false) => `<section class="sound-band"><div><h1 tabindex="-1">${esc(title)}</h1><p>${esc(subtitle)}</p></div>${mascot ? '<img src="./icons/explorer-penguin.webp" width="64" height="64" alt="">' : ''}</section>`;
    const chip = (href, name, selected = false) => `<a class="sound-chip" href="${href}"${selected ? ' aria-current="page"' : ''}>${esc(name)}</a>`;
    const mediaScope = (kind, id, content, letterId) => `<div data-sound-course="${kind}" data-source-id="${id}"${letterId ? ` data-letter-id="${letterId}"` : ''}>${content}</div>`;
    const sourceLink = '<p class="audio-credits-link"><a href="./audio-credits.html">课程与发音来源</a></p>';
    const status = '<p class="sound-status" role="status">正在加载原版媒体…</p>';
    const video = '<div class="sound-media" data-course-video hidden><video controls playsinline preload="none" aria-label="发音示范视频"></video></div>';
    const play = (key, description, text = '🔊', buttonClass = 'rule-play', disabled = false) => `<button type="button" class="${buttonClass}" data-action="course-audio" data-media="${key}" aria-label="${esc(description)}"${disabled ? ' disabled' : ''}>${text}</button>`;
    const mediaList = (items, make, attributes = '') => items.length ? `<ul class="sound-list"${attributes}>${items.map(make).join('')}</ul>` : '<p>原版此处没有条目。</p>';
    const marked = (text, { startIndex: start, endIndex: end }) => Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end >= start && end < text.length
      ? `${esc(text.slice(0, start))}<mark>${esc(text.slice(start, end + 1))}</mark>${esc(text.slice(end + 1))}`
      : esc(text);
    const exampleText = (text, entry) => `<div><strong lang="en">${marked(text, entry)}</strong><small>${esc([entry.ipa, entry.translation].filter(Boolean).join(' '))}</small></div>`;
    const relatedRules = predicate => {
      const links = lessons.filter(predicate).map(lesson => `<a class="secondary-button" href="#/rule/${encodeURIComponent(lesson.id)}">${esc(lesson.pattern)}</a>`).join('');
      return links ? `<div class="sound-actions" aria-label="相关拼读规则">${links}</div>` : '';
    };

    function ipaTable(group, active) {
      const sections = group.sections.map(section => `<tbody>${section.rows.map((row, index) => `<tr>
        ${index === 0 ? `<th class="sound-section-label" scope="rowgroup" rowspan="${section.rows.length}">${esc(section.name)}</th>` : ''}
        <th class="sound-row-label" scope="row">${esc(row.name)}</th>
        <td><div class="sound-chip-grid">${row.items.map(item => chip(ipaUrl(item.id), item.symbol, item.id === active)).join('')}</div></td>
      </tr>`).join('')}</tbody>`).join('');
      return `<div class="sound-table"><table aria-label="${esc(group.name)}音标表"><colgroup><col class="sound-section-col"><col class="sound-row-col"><col></colgroup>${sections}</table></div>`;
    }

    if (page === 'ipa') {
      const legacyItem = window.KidsExtensionData.ipa.find(item => item.id === id);
      const item = ipaItems.find(item => item.id === Number(id) || (legacyItem && normal(item.symbol) === legacyItem.symbol));
      const group = item?.group || source.ipa[id === 'consonants' ? 1 : 0];
      const back = group.id === source.ipa[0].id ? '#/ipa' : '#/ipa/consonants';
      if (!item) {
        const links = source.ipa.map((entry, index) => chip(index ? '#/ipa/consonants' : '#/ipa', entry.name, entry === group)).join('');
        return wrap('英语音标', '#/extension', `${band('48 个英语国际音标', '按元音、辅音查找音标。', true)}<nav class="sound-tabs ipa-categories" aria-label="音标分类">${links}</nav>${ipaTable(group)}`);
      }

      const detail = source.ipaDetails[item.id];
      const category = [...new Set([group.name, item.section.name, item.row.name])].filter(Boolean).join(' / ');
      const examples = mediaList(detail.examples, entry => `<li>${exampleText(entry.word, entry)}${play(`example-${entry.id}`, `播放 ${entry.word}`, '🔊', 'rule-play', true)}</li>`, ' data-course-examples');
      const pagination = `<nav class="extension-pagination" aria-label="切换音标">${detail.previous ? `<a href="${ipaUrl(detail.previous.id)}">← 上一个 ${esc(detail.previous.symbol)}</a>` : ''}${detail.next ? `<a href="${ipaUrl(detail.next.id)}">下一个 ${esc(detail.next.symbol)} →</a>` : ''}</nav>`;
      const selector = `<details class="sound-switcher"><summary>打开音标表</summary>${source.ipa.map(entry => ipaTable(entry, item.id)).join('')}</details>`;
      const pronunciation = `<section class="sound-detail"><div class="ipa-pronunciation">
        <div class="ipa-symbol"><h1 tabindex="-1">/${esc(item.symbol)}/</h1><p>${esc(category)}</p>${play('main', '听音标', '听音标', 'primary-button')}</div>${video}
      </div>${status}<h2>发音要领</h2>${detail.mnemonic ? `<p>${esc(detail.mnemonic)}</p>` : ''}<p>${esc(detail.cue)}</p></section>`;
      const practice = `<section class="sound-detail"><h2>例词</h2>${examples}${relatedRules(lesson => lesson.ipa.split(' or ').some(value => normal(value) === normal(item.symbol)))}</section>`;
      return wrap('英语音标', back, `${mediaScope('ipa', item.id, pronunciation + practice)}${pagination}${selector}<div class="sound-actions"><a class="secondary-button" href="#/phonics">自然拼读</a></div>${sourceLink}`);
    }

    function letterGroups(active) {
      return `<div class="letter-groups">${source.phonics.map(group => `<section class="letter-paper"><h2>${esc(group.name)}</h2><div class="letter-grid">${group.letters.map(letter => chip(`#/phonics/${letter.id}`, letter.letter, letter.id === active)).join('')}</div></section>`).join('')}</div>`;
    }

    const letter = letters.find(item => item.id === Number(id));
    if (!letter) return wrap('自然拼读', '#/extension', `${band('自然拼读', '选择字母或字母组合，听一听它的发音。')}${letterGroups()}<div class="sound-actions"><a class="secondary-button" href="#/library">查看探险岛规则库</a></div>`);

    const sound = letter.symbols.find(item => item.id === Number(soundId)) || letter.symbols[0];
    const activeTab = tabs.some(([key]) => key === tab) ? tab : 'mouth';
    const lettersHeader = `<div class="phonics-letters"><h1 tabindex="-1" lang="en">${esc(letter.letter)}</h1><details class="sound-switcher letter-switcher"><summary>展开字母表</summary>${letterGroups(letter.id)}</details></div>`;
    if (!sound) return wrap('自然拼读', '#/phonics', `${lettersHeader}<p class="sound-status">原版暂未提供发音内容。</p>`);

    const detail = source.phonicsDetails[sound.id];
    const pronunciations = `<div class="phonics-pronunciation"><nav class="sound-tabs" aria-label="选择发音">${letter.symbols.map(item => chip(phonicsUrl(letter.id, item.id, activeTab), item.symbol, item.id === sound.id)).join('')}</nav>${play('main', '听发音', '听发音', 'primary-button')}</div>`;
    const lessonTabs = `<nav class="sound-tabs lesson-tabs" aria-label="发音内容">${tabs.map(([key, label]) => chip(phonicsUrl(letter.id, sound.id, key), label, key === activeTab)).join('')}</nav>`;
    const letterVideo = letter.hasVideo ? '<div class="sound-media" data-course-letter-video hidden><video controls playsinline preload="none" aria-label="字母拼读视频"></video></div>' : '';
    let content = `<h2>发音方法</h2><div class="phonics-mouth">
      <div class="phonics-mouth-media"><img class="sound-media" data-course-mouth hidden alt="发音口型示范"><button type="button" class="secondary-button" data-action="course-replay" hidden>重播口型</button></div>
      <ol>${detail.mouth.map(text => `<li>${esc(text)}</li>`).join('')}</ol>
    </div>${letterVideo}`;
    if (activeTab === 'words') content = `<h2 class="sr-only">例词</h2>${mediaList(detail.words, entry => `<li>
      ${entry.hasImage ? `<img data-course-word-image="${entry.id}" width="68" height="60" alt="" hidden>` : ''}${exampleText(entry.word, entry)}${entry.hasAudio ? play(`word-${entry.id}`, `播放例词 ${entry.word}`) : ''}
    </li>`, ' data-course-words')}`;
    if (activeTab === 'sentences') content = `<h2 class="sr-only">例句</h2>${mediaList(detail.sentences, entry => {
      const voices = [
        entry.hasMaleAudio && play(`sentence-${entry.id}-male`, `男声播放例句 ${entry.text}`, '男声'),
        entry.hasFemaleAudio && play(`sentence-${entry.id}-female`, `女声播放例句 ${entry.text}`, '女声')
      ].filter(Boolean).join('');
      return `<li>${exampleText(entry.text, entry)}${voices ? `<div class="sentence-voices">${voices}</div>` : ''}</li>`;
    })}`;
    return wrap('自然拼读', '#/phonics', `${lettersHeader}${mediaScope('phonics', sound.id, `${pronunciations}${lessonTabs}<section class="sound-detail phonics-detail">${status}${content}</section>`, letter.id)}${relatedRules(lesson => lesson.pattern === letter.letter)}${sourceLink}`);
  }

  window.KidsSounds = { render };
})();
