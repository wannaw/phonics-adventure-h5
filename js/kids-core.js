/* Pure learning and progress rules shared by the page and Node tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.KidsCore = api;
})(typeof window !== 'undefined' ? window : null, function () {
  function readProgress(raw, lessons) {
    const ids = new Set(lessons.map(lesson => lesson.id));
    let value;
    try {
      value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      value = null;
    }
    const completed = {};
    if (value && typeof value.completed === 'object' && value.completed !== null) {
      for (const [id, stars] of Object.entries(value.completed)) {
        if (ids.has(id) && Number.isInteger(stars) && stars >= 1 && stars <= 3) {
          completed[id] = stars;
        }
      }
    }
    return { completed };
  }

  function nextLevelIndex(lessons, progress) {
    const firstOpen = lessons.findIndex(lesson => !progress.completed[lesson.id]);
    return firstOpen === -1 ? Math.max(0, lessons.length - 1) : firstOpen;
  }

  function isUnlocked(index, lessons, progress) {
    return index >= 0 && index < lessons.length && index <= nextLevelIndex(lessons, progress);
  }

  function recordCompletion(progress, lessonId, stars) {
    const safeStars = Math.max(1, Math.min(3, Math.trunc(stars)));
    return {
      completed: {
        ...progress.completed,
        [lessonId]: Math.max(progress.completed[lessonId] || 0, safeStars)
      }
    };
  }

  function listeningOptions(words, lessonNumber) {
    const options = words.slice(0, 3).map(item => item.word);
    const offset = lessonNumber % options.length;
    return options.slice(offset).concat(options.slice(0, offset));
  }

  function spellingTiles(word) {
    return word.chunks.map((chunk, index) => ({ chunk, index })).reverse();
  }

  function checkSpelling(word, selectedIndices) {
    return selectedIndices.map(index => word.chunks[index]).join('').toLowerCase() === word.word.toLowerCase();
  }

  function starsForMistakes(mistakes) {
    return mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1;
  }

  return { readProgress, nextLevelIndex, isUnlocked, recordCompletion, listeningOptions, spellingTiles, checkSpelling, starsForMistakes };
});
