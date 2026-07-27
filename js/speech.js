let voices = [];
let selectedVoiceURI = null;

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function pickPreferredVoice(candidateVoices) {
  const englishVoices = candidateVoices.filter(
    (voice) => voice.lang && voice.lang.toLowerCase().startsWith("en")
  );
  const pool = englishVoices.length ? englishVoices : candidateVoices;
  return (
    pool.find((voice) => /Google/i.test(voice.name)) ||
    pool.find((voice) => voice.localService === false) ||
    pool[0] ||
    null
  );
}

export function initVoices(onReady) {
  if (!isSpeechSupported()) return;

  const refresh = () => {
    voices = window.speechSynthesis.getVoices();
  };

  refresh();
  if (voices.length > 0) {
    onReady?.(voices);
    return;
  }

  window.speechSynthesis.addEventListener(
    "voiceschanged",
    () => {
      refresh();
      onReady?.(voices);
    },
    { once: true }
  );
}

export function getVoices() {
  return voices;
}

export function setVoice(voiceURI) {
  selectedVoiceURI = voiceURI;
}

export function speakLetter(letter) {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(`${letter}. ${letter}.`);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  utterance.pitch = 1.1;

  const chosenVoice =
    (selectedVoiceURI && voices.find((voice) => voice.voiceURI === selectedVoiceURI)) ||
    pickPreferredVoice(voices);
  if (chosenVoice) utterance.voice = chosenVoice;

  window.speechSynthesis.speak(utterance);
}
