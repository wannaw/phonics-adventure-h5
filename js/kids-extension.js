(function () {
  const { ipa, pictureUnits } = window.KidsExtensionData;
  const pages = new Set(['extension', 'ipa', 'picture-words']);
  const sounds = ['元音', '辅音'];
  const pictureCategories = pictureUnits.flatMap(unit => unit.categories);
  const ipaLink = id => `#/ipa/${id}`;
  const pictureLink = (category, word) => `#/picture-words/${category}${word ? '/' + word : ''}`;

  function render(page, id, wordId, { header, nav, esc, lessons }) {
    if (!pages.has(page)) return null;

    const hero = (title, description) => `<section class="extension-hero"><h1 tabindex="-1">${esc(title)}</h1><p>${esc(description)}</p></section>`;
    const wrapper = (title, back, content) => `<div class="extension-page page-with-nav">${header(title, back)}${content}${nav('extension')}</div>`;
    const chip = (url, label, detail = '') => `<a class="extension-chip" href="${url}">${detail}<strong>${esc(label)}</strong></a>`;
    const playExample = word => `<button class="rule-play" data-action="extension-word" data-word="${esc(word)}" data-accent="en-GB" aria-label="播放 ${esc(word)}">🔊</button>`;

    if (page === 'extension') {
      const cards = [
        ['#/picture-words', '🍎', '看图识词', '按主题看图、听单词和例句'],
        ['#/ipa', '🎧', '英语音标', '查找 48 个音标，听发音和例词'],
        ['#/library/vowels', '🔤', '自然拼读', '按字母和字母组合查找拼读规则']
      ];
      return wrapper('拓展学习', '#/home', `${hero('拓展学习', '选一种方式练习英语听读。')}<div class="extension-links">${cards.map(([url, icon, title, text]) => `<a class="extension-link" href="${url}"><span class="extension-icon" aria-hidden="true">${icon}</span><span><strong>${title}</strong><small>${text}</small></span></a>`).join('')}</div>`);
    }

    if (page === 'ipa') {
      const item = ipa.find(sound => sound.id === id);
      const group = item?.group || (id === 'consonants' ? sounds[1] : sounds[0]);
      const groupLink = group === sounds[1] ? ipaLink('consonants') : '#/ipa';
      if (item) {
        const index = ipa.indexOf(item);
        const related = lessons.filter(lesson => lesson.ipa.split(' or ').some(value => value === `/${item.symbol}/`));
        const recording = item.pattern ? `<button class="primary-button" data-action="play-phoneme" data-pattern="${esc(item.pattern)}" data-variant="${item.variant ?? 0}">听音标</button>` : `<button class="primary-button" data-action="play-ipa" data-id="${esc(item.id)}">听音标</button>`;
        const examples = item.examples.map(word => `<li><strong lang="en">${esc(word)}</strong>${playExample(word)}</li>`).join('');
        const nearby = `<nav class="extension-pagination" aria-label="切换音标">${ipa[index - 1] ? `<a href="${ipaLink(ipa[index - 1].id)}">← 上一个</a>` : ''}${ipa[index + 1] ? `<a href="${ipaLink(ipa[index + 1].id)}">下一个 →</a>` : ''}</nav>`;
        return wrapper('英语音标', groupLink, `${hero(`/${item.symbol}/`, `${item.group} · ${item.section}`)}<section class="extension-detail"><h2>发音要领</h2><p>${esc(item.cue)}</p><div class="extension-actions">${recording}</div><h2>听例词</h2><ul class="extension-example-list">${examples}</ul>${related.length ? `<h2>相关拼读规则</h2><div class="extension-actions">${related.map(lesson => `<a class="secondary-button" href="#/rule/${encodeURIComponent(lesson.id)}">${esc(lesson.pattern)}</a>`).join('')}</div>` : ''}</section>${nearby}<p class="audio-credits-link"><a href="./audio-credits.html">发音来源</a></p>`);
      }
      const choices = ipa.filter(sound => sound.group === group);
      const sections = [...new Set(choices.map(sound => sound.section))];
      const tabs = sounds.map((label, index) => `<a href="${index ? ipaLink('consonants') : '#/ipa'}" ${label === group ? 'aria-current="page"' : ''}>${label}</a>`).join('');
      return wrapper('英语音标', '#/extension', `${hero('48 个英语音标', '选一个音标，听示范发音和英式英语例词。')}<nav class="extension-tabs" aria-label="音标分类">${tabs}</nav><div class="extension-groups">${sections.map(section => `<section class="extension-group"><h2>${esc(section)}</h2><div class="extension-grid">${choices.filter(sound => sound.section === section).map(sound => chip(ipaLink(sound.id), `/${sound.symbol}/`)).join('')}</div></section>`).join('')}</div>`);
    }

    const category = pictureCategories.find(entry => entry.id === id);
    const picture = icon => `<span class="extension-icon" aria-hidden="true">${esc(icon)}</span>`;
    if (!category) {
      const groups = pictureUnits.map((unit, index) => `<details class="extension-group" ${index === 0 ? 'open' : ''}><summary>${esc(unit.title)}</summary><div class="extension-picture-grid">${unit.categories.map(entry => chip(pictureLink(entry.id), entry.title, picture(entry.icon))).join('')}</div></details>`).join('');
      return wrapper('看图识词', '#/extension', `${hero('看图识词', '选一个分类，看看你认识哪些单词。')}<div class="extension-groups">${groups}</div>`);
    }
    const word = category.words.find(entry => entry.word === wordId);
    if (!word) {
      const cards = category.words.map(entry => chip(pictureLink(category.id, entry.word), entry.word, picture(entry.icon))).join('');
      return wrapper('看图识词', '#/picture-words', `${hero(category.title, `${category.words.length} 张词卡`)}<section class="extension-group" aria-label="词卡列表"><div class="extension-picture-grid">${cards}</div></section>`);
    }
    const index = category.words.indexOf(word);
    const previous = category.words[index - 1];
    const next = category.words[index + 1];
    return wrapper('看图识词', pictureLink(category.id), `${hero(word.word, `${category.title} · ${index + 1} / ${category.words.length}`)}<section class="extension-detail"><div class="extension-picture" aria-hidden="true">${esc(word.icon)}</div><h2>${esc(word.meaning)}</h2><div class="extension-actions"><button class="primary-button" data-action="extension-word" data-word="${esc(word.word)}">听单词</button></div><h2>例句</h2><p lang="en">${esc(word.sentence)}</p><div class="extension-actions"><button class="secondary-button" data-action="extension-sentence" data-word="${esc(word.sentence)}">听例句</button></div></section><nav class="extension-pagination" aria-label="切换词卡">${previous ? `<a href="${pictureLink(category.id, previous.word)}">← 上一词</a>` : ''}${next ? `<a href="${pictureLink(category.id, next.word)}">下一词 →</a>` : `<a href="${pictureLink(category.id)}">返回词表 →</a>`}</nav>`);
  }

  window.KidsExtension = { render };
})();
