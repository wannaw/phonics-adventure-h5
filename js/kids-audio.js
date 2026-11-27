(function () {
  const PHONEME_FILES = new Set(['b', 'c', 'm', 'p', 's', 't', 'a', 'e', 'i', 'o', 'u', 'sh', 'ch', 'ng', 'th', 'wh', 'a_e', 'i_e', 'o_e', 'u_e', 'u_e_oo']);
  const GENERATED_WORDS = new Set(['bike', 'hope', 'late', 'name', 'nine', 'rope', 'time', 'tune', 'what']);
  let activeAudio = null;

  function stop() {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function speak(word, notify, accent = 'en-US') {
    if (!('speechSynthesis' in window)) {
      notify('暂时无法播放，请看着字母试着读一读');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = accent;
    utterance.rate = 0.72;
    utterance.volume = 1;
    utterance.onerror = event => {
      if (!['canceled', 'interrupted'].includes(event.error)) notify('暂时无法播放，请看着字母试着读一读');
    };
    window.speechSynthesis.speak(utterance);
  }

  function playWord(word, notify) {
    stop();
    const name = word.toLowerCase();
    const audio = new Audio('./audio/words/' + encodeURIComponent(name) + (GENERATED_WORDS.has(name) ? '.wav' : '.mp3'));
    audio.playbackRate = GENERATED_WORDS.has(name) ? 1 : 0.88;
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

  function playPhoneme(pattern, variant, notify) {
    const file = pattern === 'ck' ? 'c' : pattern === 'u_e' && variant === 1 ? 'u_e_oo' : pattern;
    if (!PHONEME_FILES.has(file)) return;
    playSound('./audio/phonemes/' + file + '.mp3', notify);
  }

  function playIpa(id, notify) {
    playSound('./audio/ipa/' + encodeURIComponent(id) + '.wav', notify);
  }

  function playSpeech(text, notify, accent) {
    stop();
    speak(text, notify, accent);
  }

  function playSound(source, notify) {
    stop();
    const audio = new Audio(source);
    activeAudio = audio;
    const failed = () => {
      if (activeAudio !== audio) return;
      activeAudio = null;
      notify('发音暂时无法播放');
    };
    audio.addEventListener('error', failed, { once: true });
    audio.addEventListener('ended', () => { if (activeAudio === audio) activeAudio = null; }, { once: true });
    audio.play().catch(failed);
  }

  window.KidsAudio = { playWord, playPhoneme, playIpa, playSpeech, stop };
})();
