export function speakText(text, lang = "en-US", rate = 0.8) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("Speech synthesis not supported");
    return;
  }

  const synth = window.speechSynthesis;

  // If already speaking, cancel first to avoid overlap
  if (synth.speaking) {
    try {
      synth.cancel();
    } catch (_) {
      // ignore
    }
  }

  const startSpeaking = () => {
    const utterance = new SpeechSynthesisUtterance(String(text ?? ""));
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Handle errors; ignore benign interruption/cancellation noise
    utterance.onerror = (event) => {
      const err = event?.error || "unknown";
      if (err === "interrupted" || err === "canceled") return;
      console.error("Speech synthesis error:", err);
    };

    synth.speak(utterance);
  };

  // Small timeout allows cancel() to settle before speaking again
  setTimeout(startSpeaking, 40);
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSynthesisSupported() {
  return "speechSynthesis" in window;
}
