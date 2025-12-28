// Sound effects for POS actions
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled) return;
    
    this.init();
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  addToCart() {
    // Pleasant "pop" sound
    this.playTone(800, 0.1);
  }

  removeFromCart() {
    // Lower tone for removal
    this.playTone(400, 0.1);
  }

  checkout() {
    // Success chime
    this.playTone(523.25, 0.15); // C
    setTimeout(() => this.playTone(659.25, 0.15), 100); // E
    setTimeout(() => this.playTone(783.99, 0.2), 200); // G
  }

  error() {
    // Error buzz
    this.playTone(200, 0.2, 'sawtooth');
  }

  click() {
    // Soft click
    this.playTone(1000, 0.05);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
