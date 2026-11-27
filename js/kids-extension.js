(function () {
  const { pictureUnits } = window.KidsExtensionData;
  const pages = new Set(['extension', 'picture-words']);
  const pictureCategories = pictureUnits.flatMap(unit => unit.categories.map(category => ({ ...category, unit })));
  const pictureLink = (category, word) => `#/picture-words/${category}${word ? '/' + encodeURIComponent(word) : ''}`;

  function render(page, id, wordId, { header, nav, esc }) {
    if (!pages.has(page)) return null;

    const hero = (title, description) => `<section class="extension-hero"><h1 tabindex="-1">${esc(title)}</h1><p>${esc(description)}</p></section>`;
    const wrapper = (title, back, content) => `<div class="extension-page page-with-nav">${header(title, back)}${content}${nav('extension')}</div>`;
    const chip = (url, label, detail = '') => `<a class="extension-chip" href="${url}">${detail}<strong>${esc(label)}</strong></a>`;
    if (page === 'extension') {
      const cards = [
        ['#/picture-words', '🍎', '看图识词', '按主题看图、听单词和例句'],
        ['#/ipa', '🎧', '英语音标', '查找 48 个音标，听发音和例词'],
        ['#/phonics', '🔤', '自然拼读', '按字母和字母组合学口型、例词和例句']
      ];
      return wrapper('拓展学习', '#/home', `${hero('拓展学习', '选一种方式练习英语听读。')}<div class="extension-links">${cards.map(([url, icon, title, text]) => `<a class="extension-link" href="${url}"><span class="extension-icon" aria-hidden="true">${icon}</span><span><strong>${title}</strong><small>${text}</small></span></a>`).join('')}</div>`);
    }

    const category = pictureCategories.find(entry => entry.id === id);
    const picture = icon => `<span class="extension-icon" aria-hidden="true">${esc(icon)}</span>`;
    if (!category) {
      const openUnit = pictureUnits.find(unit => unit.id === id) || pictureUnits[0];
      const groups = pictureUnits.map(unit => `<details class="extension-group" ${unit === openUnit ? 'open' : ''}><summary>${esc(unit.title)}</summary><div class="extension-picture-grid">${unit.categories.map(entry => chip(pictureLink(entry.id), entry.title, picture(entry.icon))).join('')}</div></details>`).join('');
      return wrapper('看图识词', '#/extension', `${hero('看图识词', '按单元选分类。已核对的词卡可以直接听读。')}<div class="extension-groups">${groups}</div>`);
    }
    const unitLink = category.unit === pictureUnits[0] ? '#/picture-words' : pictureLink(category.unit.id);
    if (!category.words?.length) {
      const status = category.words === null ? '这个分类的原版词卡还在核对。' : '原版当前未显示词卡。';
      return wrapper('看图识词', unitLink, `${hero(category.title, category.unit.title)}<section class="extension-detail"><p>${status}</p></section>`);
    }
    const word = category.words.find(entry => entry.word === wordId);
    if (!word) {
      const cards = category.words.map(entry => chip(pictureLink(category.id, entry.word), entry.word, picture(entry.icon))).join('');
      return wrapper('看图识词', unitLink, `${hero(category.title, `${category.unit.title} · ${category.words.length} 张词卡`)}<section class="extension-group" aria-label="词卡列表"><div class="extension-picture-grid">${cards}</div></section>`);
    }
    const index = category.words.indexOf(word);
    const previous = category.words[index - 1];
    const next = category.words[index + 1];
    const example = word.sentence ? `<h2>例句</h2><p lang="en">${esc(word.sentence)}</p><div class="extension-actions"><button class="secondary-button" data-action="extension-sentence" data-word="${esc(word.sentence)}">听例句</button></div>` : '';
    return wrapper('看图识词', pictureLink(category.id), `${hero(word.word, `${category.title} · ${index + 1} / ${category.words.length}`)}<section class="extension-detail"><div class="extension-picture" aria-hidden="true">${esc(word.icon)}</div><h2>${esc(word.meaning)}</h2><div class="extension-actions"><button class="primary-button" data-action="extension-word" data-word="${esc(word.word)}">听单词</button></div>${example}</section><nav class="extension-pagination" aria-label="切换词卡">${previous ? `<a href="${pictureLink(category.id, previous.word)}">← 上一词</a>` : ''}${next ? `<a href="${pictureLink(category.id, next.word)}">下一词 →</a>` : `<a href="${pictureLink(category.id)}">返回词表 →</a>`}</nav>`);
  }

  window.KidsExtension = { render };
})();
