/**
 * Zero-Dependency Web Audio API Sound & Music Synthesizer for Cahoot!
 * Produces crisp, energetic, arcade-style sound effects & authentic background music loops.
 */

type SoundEventListener = (isMuted: boolean) => void;

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isLobbyPlaying: boolean = false;
  private isQuestionBeatPlaying: boolean = false;
  private musicInterval: any = null;
  private listeners: Set<SoundEventListener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cahoot_audio_muted");
        if (saved !== null) {
          this.isMuted = saved === "true";
        }
      } catch (e) {}
    }
  }

  public subscribe(fn: SoundEventListener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isMuted));
  }

  public initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem("cahoot_audio_muted", String(this.isMuted));
    } catch (e) {}

    if (this.isMuted) {
      this.stopAllMusic();
    } else {
      if (this.isLobbyPlaying) {
        this.startLobbyMusic();
      }
    }

    this.notify();
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem("cahoot_audio_muted", String(this.isMuted));
    } catch (e) {}

    if (this.isMuted) {
      this.stopAllMusic();
    }
    this.notify();
  }

  // --- SOUND EFFECTS ---

  // Play click / select button sound
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  // Play tension countdown tick
  public playTick(pitchMultiplier: number = 1.0) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440 * pitchMultiplier, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // Play "Get Ready" pulse
  public playGetReadyPulse(count: number) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const freq = count === 1 ? 880 : 587.33; // Higher pitch on 1
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }

  // Play Correct Answer uplifting chime
  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.07;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // Play Wrong Answer soft buzz
  public playWrong() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }

  // Play Times Up gong
  public playTimesUp() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }

  // Play Leaderboard swoosh
  public playLeaderboard() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(261.63, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  // Play Final Podium Fanfare
  public playPodiumFanfare() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const chords = [
      { notes: [261.63, 329.63, 392.0], start: 0.0, dur: 0.3 }, // C
      { notes: [293.66, 369.99, 440.0], start: 0.35, dur: 0.3 }, // D
      { notes: [329.63, 415.3, 493.88], start: 0.7, dur: 0.3 }, // E
      { notes: [523.25, 659.25, 783.99, 1046.5], start: 1.05, dur: 1.5 }, // High C major victory chord
    ];

    chords.forEach((chord) => {
      chord.notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + chord.start;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + chord.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + chord.dur);
      });
    });
  }

  // --- BACKGROUND MUSIC ENGINE ---

  // 1. Energetic Lobby Theme (Bouncy Kahoot-style syncopated melody & funk bass)
  public startLobbyMusic() {
    this.isLobbyPlaying = true;
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.stopAllMusic();
    this.isLobbyPlaying = true;

    // Funk Bass + Lead Notes Sequence (C minor pentatonic groove)
    const melody = [
      { bass: 130.81, lead: 523.25 }, // C3 + C5
      { bass: 0, lead: 659.25 },      // E5
      { bass: 155.56, lead: 587.33 }, // Eb3 + D5
      { bass: 0, lead: 523.25 },      // C5
      { bass: 174.61, lead: 783.99 }, // F3 + G5
      { bass: 0, lead: 659.25 },      // E5
      { bass: 196.0, lead: 1046.5 },  // G3 + C6
      { bass: 155.56, lead: 783.99 }, // Eb3 + G5
    ];

    let step = 0;

    this.musicInterval = setInterval(() => {
      if (!this.isLobbyPlaying || this.isMuted || !this.ctx) return;
      const cur = melody[step % melody.length];

      // Play Bass
      if (cur.bass > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = "triangle";
        bOsc.frequency.setValueAtTime(cur.bass, this.ctx.currentTime);
        bGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        bGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);
        bOsc.start();
        bOsc.stop(this.ctx.currentTime + 0.22);
      }

      // Play Lead Chime
      if (cur.lead > 0) {
        const lOsc = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();
        lOsc.type = "sine";
        lOsc.frequency.setValueAtTime(cur.lead, this.ctx.currentTime);
        lGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        lGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
        lOsc.connect(lGain);
        lGain.connect(this.ctx.destination);
        lOsc.start();
        lOsc.stop(this.ctx.currentTime + 0.18);
      }

      step++;
    }, 240);
  }

  // 2. Question Countdown Tension Beat (Fast pulsing arcade suspense)
  public startQuestionMusic() {
    this.isQuestionBeatPlaying = true;
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.stopAllMusic();
    this.isQuestionBeatPlaying = true;

    const rhythm = [110, 110, 220, 110, 146.83, 110, 220, 164.81]; // Tension A2 rhythm
    let step = 0;

    this.musicInterval = setInterval(() => {
      if (!this.isQuestionBeatPlaying || this.isMuted || !this.ctx) return;
      const freq = rhythm[step % rhythm.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);

      step++;
    }, 180);
  }

  public stopLobbyMusic() {
    this.isLobbyPlaying = false;
    this.stopAllMusic();
  }

  public stopQuestionMusic() {
    this.isQuestionBeatPlaying = false;
    this.stopAllMusic();
  }

  public stopAllMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sounds = new SoundManager();
