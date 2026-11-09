(function () {
  const BASE = 'https://phonics-audio-9b1.pages.dev/audio/word/';
  let activeAudio = null;

  function stop() {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function speak(word, notify) {
    if (!('speechSynthesis' in window)) {
      notify('暂时无法播放，请看着字母试着读一读');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.82;
    utterance.onerror = () => notify('暂时无法播放，请看着字母试着读一读');
    window.speechSynthesis.speak(utterance);
  }

  function playWord(word, notify) {
    stop();
    const audio = new Audio(BASE + encodeURIComponent(word.toLowerCase()) + '.mp3');
    activeAudio = audio;
    let failed = false;
    const fallback = () => {
      if (failed || activeAudio !== audio) return;
      failed = true;
      activeAudio = null;
      speak(word, notify);
    };
    audio.addEventListener('error', fallback, { once: true });
    audio.addEventListener('ended', () => { if (activeAudio === audio) activeAudio = null; }, { once: true });
    audio.play().catch(fallback);
  }

  window.KidsAudio = { playWord, stop };
})();
