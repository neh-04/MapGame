// Simple wrapper for window.speechSynthesis
export const speak = (text: string, rate: number = 0.9, pitch: number = 1.2) => {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel(); // Stop previous

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate; 
  utterance.pitch = pitch; 
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  
  // Prioritized list of known good female/child-friendly voices
  const preferredVoiceNames = [
    'Google US English', // Chrome (often female)
    'Samantha', // macOS
    'Karen', // macOS
    'Microsoft Zira', // Windows
    'Microsoft Hazel', // Windows
    'Moira',
    'Tessa',
    'Veena', // Good for Indian context if available
    'Rishi' // Sometimes available, check gender
  ];

  // Try to find a specific match first
  let selectedVoice = voices.find(v => preferredVoiceNames.some(name => v.name.includes(name)));

  // If not found, look for any voice with 'female' in the name/lang
  if (!selectedVoice) {
    selectedVoice = voices.find(v => 
      v.lang.includes('en') && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
    );
  }

  // Fallback to any English voice
  if (!selectedVoice) {
     selectedVoice = voices.find(v => v.lang.startsWith('en'));
  }
  
  if (selectedVoice) utterance.voice = selectedVoice;

  window.speechSynthesis.speak(utterance);
};

// Generative Music Player
class MusicPlayer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private schedulerTimer: number | undefined;
  private tempo: number = 100;
  private lookahead: number = 25.0;
  private scheduleAheadTime: number = 0.1;
  private currentNote: number = 0;
  
  // C Major Pentatonic Scale (Happy, child-friendly)
  // C4, D4, E4, G4, A4, C5
  private scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playNote(time: number) {
    if (!this.ctx) return;
    
    // Pick a note from the scale - semi-random but biased towards melody
    // Simple generative pattern: walk up/down or repeat
    if (Math.random() > 0.7) {
       this.currentNote = Math.floor(Math.random() * this.scale.length);
    } else {
       // Step up or down
       const step = Math.random() > 0.5 ? 1 : -1;
       this.currentNote = (this.currentNote + step + this.scale.length) % this.scale.length;
    }

    const freq = this.scale[this.currentNote];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine'; // Soft, lullaby-like
    osc.frequency.value = freq;
    
    // Envelope for a bell/chime sound
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.1, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.0); // Long release

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 1.5);
  }

  private scheduler() {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      // Simple rhythm: mostly quarter notes, occasional half notes
      this.playNote(this.nextNoteTime);
      const beats = Math.random() > 0.8 ? 2 : 1;
      const secondsPerBeat = 60.0 / this.tempo;
      this.nextNoteTime += beats * secondsPerBeat;
    }
    this.schedulerTimer = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  public play() {
    this.init();
    if (this.isPlaying) return;
    
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.nextNoteTime = this.ctx!.currentTime + 0.1;
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    window.clearTimeout(this.schedulerTimer);
  }

  public toggle() {
    if (this.isPlaying) this.stop();
    else this.play();
    return this.isPlaying;
  }
}

export const musicPlayer = new MusicPlayer();

export const playSoundEffect = (type: 'correct' | 'wrong' | 'pop' | 'win') => {
  const context = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  const now = context.currentTime;

  if (type === 'correct') {
    // Happy "Ding-Dong"
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, now); // C5
    oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  } else if (type === 'wrong') {
    // Gentle "Bonk" (low sine)
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.linearRampToValueAtTime(100, now + 0.2);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  } else if (type === 'pop') {
    // Woodblock "Pop"
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, now);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  } else if (type === 'win') {
    // Arpeggio
    oscillator.type = 'square';
    // Just a placeholder, actually generating a sequence is complex in one go without a sequencer,
    // so we'll do a simple slide up
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }
};