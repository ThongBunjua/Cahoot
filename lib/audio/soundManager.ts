/**
 * Zero-Dependency Web Audio API Sound & Music Synthesizer for Cahoot!
 * Produces crisp, energetic, arcade-style sound effects, authentic background music loops,
 * drumrolls, fireworks explosions, and stadium crowd cheers.
 */

type SoundEventListener = (isMuted: boolean) => void;

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isLobbyPlaying: boolean = false;
  private isQuestionBeatPlaying: boolean = false;
  private musicInterval: any = null;
  private listeners: Set<SoundEventListener> = new Set();
  private unlocked: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cahoot_audio_muted");
        if (saved !== null) {
          this.isMuted = saved === "true";
        }
      } catch (e) {}

      this.setupAutoUnlock();
    }
  }

  private setupAutoUnlock() {
    if (typeof window === "undefined" || this.unlocked) return;

    const unlock = () => {
      this.unlocked = true;
      const ctx = this.initContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().then(() => {
          if (!this.isMuted) {
            if (this.isLobbyPlaying) {
              this.startLobbyMusic();
            } else if (this.isQuestionBeatPlaying) {
              this.startQuestionMusic();
            }
          }
        }).catch(() => {});
      }

      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };

    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock);
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
    const ctx = this.initContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem("cahoot_audio_muted", String(this.isMuted));
    } catch (e) {}

    if (this.isMuted) {
      this.stopAllMusic();
    } else {
      if (this.isLobbyPlaying) {
        this.startLobbyMusic();
      } else if (this.isQuestionBeatPlaying) {
        this.startQuestionMusic();
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

    const freq = count === 1 ? 880 : 587.33;
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

    const notes = [523.25, 659.25, 783.99, 1046.5];
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

  // =========================================================================
  // SUSPENSE & FINALE AUDIO SYNTHESIS
  // =========================================================================

  // 1. Realistic Drumroll with rapid snare hits building suspense
  public playDrumroll(durationSec: number = 1.4) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const numHits = Math.floor(durationSec * 22); // 22 rapid hits per second
    const stepTime = durationSec / numHits;

    for (let i = 0; i < numHits; i++) {
      const hitTime = ctx.currentTime + i * stepTime;
      const progress = i / numHits; // 0 to 1 building intensity

      // Snare Noise Burst
      const bufferSize = Math.floor(ctx.sampleRate * 0.04);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * (1 - j / bufferSize);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(280 + progress * 200, hitTime);
      filter.Q.setValueAtTime(2.0, hitTime);

      const gain = ctx.createGain();
      const vol = 0.08 + progress * 0.22;
      gain.gain.setValueAtTime(vol, hitTime);
      gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(hitTime);
      noise.stop(hitTime + 0.04);

      // Low Tom resonance on every hit
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140 + progress * 60, hitTime);
      osc.frequency.exponentialRampToValueAtTime(60, hitTime + 0.05);

      oscGain.gain.setValueAtTime(vol * 0.7, hitTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.05);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(hitTime);
      osc.stop(hitTime + 0.05);
    }
  }

  // 2. Fireworks Explosions with whistling ascent and multi-pop crackles
  public playFireworks(burstCount: number = 3) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    for (let b = 0; b < burstCount; b++) {
      const burstDelay = ctx.currentTime + b * 0.45;

      // Whistle up
      const whistle = ctx.createOscillator();
      const whistleGain = ctx.createGain();
      whistle.type = "sine";
      whistle.frequency.setValueAtTime(400, burstDelay);
      whistle.frequency.exponentialRampToValueAtTime(1800, burstDelay + 0.25);

      whistleGain.gain.setValueAtTime(0.12, burstDelay);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, burstDelay + 0.25);

      whistle.connect(whistleGain);
      whistleGain.connect(ctx.destination);
      whistle.start(burstDelay);
      whistle.stop(burstDelay + 0.25);

      // Deep Boom Explosion
      const boomTime = burstDelay + 0.26;
      const boom = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boom.type = "sine";
      boom.frequency.setValueAtTime(160, boomTime);
      boom.frequency.exponentialRampToValueAtTime(30, boomTime + 0.5);

      boomGain.gain.setValueAtTime(0.35, boomTime);
      boomGain.gain.exponentialRampToValueAtTime(0.001, boomTime + 0.5);

      boom.connect(boomGain);
      boomGain.connect(ctx.destination);
      boom.start(boomTime);
      boom.stop(boomTime + 0.5);

      // Crackling Sparkle Burst (Multi noise spikes)
      for (let s = 0; s < 6; s++) {
        const sTime = boomTime + 0.05 + s * 0.06;
        const bufferSize = Math.floor(ctx.sampleRate * 0.05);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = (Math.random() * 2 - 1) * (1 - j / bufferSize);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.setValueAtTime(1500, sTime);

        const sGain = ctx.createGain();
        sGain.gain.setValueAtTime(0.15, sTime);
        sGain.gain.exponentialRampToValueAtTime(0.001, sTime + 0.05);

        noise.connect(filter);
        filter.connect(sGain);
        sGain.connect(ctx.destination);

        noise.start(sTime);
        noise.stop(sTime + 0.05);
      }
    }
  }

  // 3. Stadium Crowd Cheer and Applause
  public playCrowdCheer(durationSec: number = 3.5) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    // Filtered pink noise for continuous cheering roar
    const bufferSize = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.25;
    }

    const cheerNoise = ctx.createBufferSource();
    cheerNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(650, ctx.currentTime);
    filter.Q.setValueAtTime(0.8, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.22, ctx.currentTime + durationSec - 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

    cheerNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    cheerNoise.start();
    cheerNoise.stop(ctx.currentTime + durationSec);

    // Occasional celebratory audience whistles
    [0.3, 0.9, 1.6, 2.2].forEach((delay) => {
      const wTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const wGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, wTime);
      osc.frequency.linearRampToValueAtTime(2200, wTime + 0.15);
      osc.frequency.linearRampToValueAtTime(1600, wTime + 0.35);

      wGain.gain.setValueAtTime(0.06, wTime);
      wGain.gain.exponentialRampToValueAtTime(0.001, wTime + 0.35);

      osc.connect(wGain);
      wGain.connect(ctx.destination);
      osc.start(wTime);
      osc.stop(wTime + 0.35);
    });
  }

  // 4. Grand Champion Grand Finale (Fanfare + Fireworks + Roaring Cheer)
  public playChampionReveal() {
    this.playPodiumFanfare();
    this.playFireworks(4);
    this.playCrowdCheer(4.0);
  }

  // 5. Classic Podium Fanfare
  public playPodiumFanfare() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const chords = [
      { notes: [261.63, 329.63, 392.0], start: 0.0, dur: 0.28 },
      { notes: [293.66, 369.99, 440.0], start: 0.32, dur: 0.28 },
      { notes: [329.63, 415.3, 493.88], start: 0.65, dur: 0.28 },
      { notes: [523.25, 659.25, 783.99, 1046.5], start: 0.98, dur: 1.8 },
    ];

    chords.forEach((chord) => {
      chord.notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + chord.start;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.24, startTime);
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
    this.isQuestionBeatPlaying = false;
    if (this.isMuted) return;

    const ctx = this.initContext();
    if (!ctx) return;

    this.stopAllMusic();
    this.isLobbyPlaying = true;

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

  // 2. Question Countdown Tension Beat (Fast pulsing arcade suspense + bassline)
  public startQuestionMusic() {
    this.isQuestionBeatPlaying = true;
    this.isLobbyPlaying = false;
    if (this.isMuted) return;

    const ctx = this.initContext();
    if (!ctx) return;

    this.stopAllMusic();
    this.isQuestionBeatPlaying = true;

    // Iconic syncopated question groove: Root-Octave Bassline + High Ticking Chime
    const groove = [
      { bass: 110.0, lead: 440.0 }, // A2 + A4
      { bass: 0, lead: 523.25 },     // C5
      { bass: 220.0, lead: 440.0 }, // A3 + A4
      { bass: 0, lead: 659.25 },     // E5
      { bass: 146.83, lead: 587.33 },// D3 + D5
      { bass: 0, lead: 523.25 },     // C5
      { bass: 220.0, lead: 659.25 }, // A3 + E5
      { bass: 164.81, lead: 783.99 },// E3 + G5
    ];
    let step = 0;

    this.musicInterval = setInterval(() => {
      if (!this.isQuestionBeatPlaying || this.isMuted || !this.ctx) return;
      const beat = groove[step % groove.length];

      // Bass synth note
      if (beat.bass > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = "sawtooth";
        bOsc.frequency.setValueAtTime(beat.bass, this.ctx.currentTime);
        bGain.gain.setValueAtTime(0.09, this.ctx.currentTime);
        bGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);
        bOsc.start();
        bOsc.stop(this.ctx.currentTime + 0.16);
      }

      // High Ticking Arp Note
      if (beat.lead > 0) {
        const lOsc = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();
        lOsc.type = "triangle";
        lOsc.frequency.setValueAtTime(beat.lead, this.ctx.currentTime);
        lGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        lGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.10);

        lOsc.connect(lGain);
        lGain.connect(this.ctx.destination);
        lOsc.start();
        lOsc.stop(this.ctx.currentTime + 0.10);
      }

      step++;
    }, 190);
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
