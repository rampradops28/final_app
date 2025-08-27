export function speakText(text, lang = "en-US", rate = 0.8) {
  if (!window.speechSynthesis) {
    console.warn("Speech synthesis not supported");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Handle errors
  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event.error);
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSynthesisSupported() {
  return "speechSynthesis" in window;
}
