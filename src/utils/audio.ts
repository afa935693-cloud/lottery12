export const USER_KHMER_AUDIO_PATH = '/assets/aistudio/tts_c3510720_e0f87616.mp3';

export interface CountdownCue {
  time: number; // in seconds
  figure: number;
  khmer: string;
  phonetic: string;
}

export const KHMER_AUDIO_CUES: CountdownCue[] = [
  { time: 0.0, figure: 10, khmer: 'ដប់', phonetic: 'Dop' },
  { time: 1.36, figure: 9, khmer: 'ប្រាំបួន', phonetic: 'Pram Buon' },
  { time: 2.90, figure: 8, khmer: 'ប្រាំបី', phonetic: 'Pram Bei' },
  { time: 4.44, figure: 7, khmer: 'ប្រាំពីរ', phonetic: 'Pram Pir' },
  { time: 5.98, figure: 6, khmer: 'ប្រាំមួយ', phonetic: 'Pram Muoy' },
  { time: 7.52, figure: 5, khmer: 'ប្រាំ', phonetic: 'Pram' },
  { time: 8.90, figure: 4, khmer: 'បួន', phonetic: 'Buon' },
  { time: 10.16, figure: 3, khmer: 'បី', phonetic: 'Bei' },
  { time: 11.40, figure: 2, khmer: 'ពីរ', phonetic: 'Pir' },
  { time: 12.61, figure: 1, khmer: 'មួយ', phonetic: 'Muoy' },
  { time: 13.93, figure: 0, khmer: 'សូមសំណាងល្អ', phonetic: 'Som Samnang Laor' },
];

export const KHMER_NUM_WORDS: Record<number, { khmer: string; phonetic: string }> = {
  10: { khmer: 'ដប់', phonetic: 'Dop' },
  9: { khmer: 'ប្រាំបួន', phonetic: 'Pram Buon' },
  8: { khmer: 'ប្រាំបី', phonetic: 'Pram Bei' },
  7: { khmer: 'ប្រាំពីរ', phonetic: 'Pram Pir' },
  6: { khmer: 'ប្រាំមួយ', phonetic: 'Pram Muoy' },
  5: { khmer: 'ប្រាំ', phonetic: 'Pram' },
  4: { khmer: 'បួន', phonetic: 'Buon' },
  3: { khmer: 'បី', phonetic: 'Bei' },
  2: { khmer: 'ពីរ', phonetic: 'Pir' },
  1: { khmer: 'មួយ', phonetic: 'Muoy' },
  0: { khmer: 'សូមសំណាងល្អ', phonetic: 'Som Samnang Laor' },
};

// Web Audio API Sound Synthesizer for Yuki 12
class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private userAudio: HTMLAudioElement | null = null;
  private animFrameId: number | null = null;
  private cueTimeouts: NodeJS.Timeout[] = [];

  constructor() {
    this.isMuted = localStorage.getItem('yuki_muted') === 'true';
    if (typeof window !== 'undefined') {
      try {
        this.userAudio = new Audio(USER_KHMER_AUDIO_PATH);
        this.userAudio.preload = 'auto';
      } catch {}
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('yuki_muted', String(this.isMuted));
    if (this.isMuted) {
      if (this.userAudio) {
        this.userAudio.pause();
      }
    } else {
      if (this.userAudio && this.userAudio.currentTime > 0 && !this.userAudio.ended) {
        this.userAudio.play().catch(() => {});
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Directly plays the user's uploaded audio file (/assets/aistudio/tts_c3510720_e0f87616.mp3)
   * while tracking the exact currentTime to synchronize the displayed figure with the spoken audio in real-time.
   */
  public startKhmerCountdown(
    onFigureChange: (figure: number, khmerText: string) => void,
    onCompleted: () => void
  ) {
    this.stopKhmerCountdown();

    if (!this.userAudio && typeof window !== 'undefined') {
      this.userAudio = new Audio(USER_KHMER_AUDIO_PATH);
      this.userAudio.preload = 'auto';
    }

    const audio = this.userAudio;
    let finished = false;

    const complete = () => {
      if (finished) return;
      finished = true;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      this.cueTimeouts.forEach(clearTimeout);
      this.cueTimeouts = [];
      onCompleted();
    };

    if (audio) {
      audio.currentTime = 0;
      if (!this.isMuted) {
        audio.play().catch(() => {});
      }

      audio.onended = () => {
        complete();
      };

      let currentFig = -1;

      const trackProgress = () => {
        if (finished) return;
        const curTime = audio.currentTime;

        // Find current cue
        let activeCue = KHMER_AUDIO_CUES[0];
        for (let i = KHMER_AUDIO_CUES.length - 1; i >= 0; i--) {
          if (curTime >= KHMER_AUDIO_CUES[i].time) {
            activeCue = KHMER_AUDIO_CUES[i];
            break;
          }
        }

        if (activeCue.figure !== currentFig) {
          currentFig = activeCue.figure;
          onFigureChange(activeCue.figure, activeCue.khmer);
        }

        if (curTime >= 15.6) {
          complete();
          return;
        }

        this.animFrameId = requestAnimationFrame(trackProgress);
      };

      this.animFrameId = requestAnimationFrame(trackProgress);

      // Safety timeout after 16s
      const tSafe = setTimeout(complete, 16000);
      this.cueTimeouts.push(tSafe);
    } else {
      // Fallback timer matching exact cue times
      KHMER_AUDIO_CUES.forEach((cue) => {
        const t = setTimeout(() => {
          onFigureChange(cue.figure, cue.khmer);
        }, cue.time * 1000);
        this.cueTimeouts.push(t);
      });
      const tEnd = setTimeout(complete, 15700);
      this.cueTimeouts.push(tEnd);
    }
  }

  public stopKhmerCountdown() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.cueTimeouts.forEach(clearTimeout);
    this.cueTimeouts = [];
    if (this.userAudio) {
      this.userAudio.pause();
      this.userAudio.currentTime = 0;
    }
  }

  public playKhmerCountdown() {
    this.startKhmerCountdown(() => {}, () => {});
  }

  public playKhmerCount(seconds: number) {
    // Kept for backwards-compatibility
    if (seconds === 10) {
      this.startKhmerCountdown(() => {}, () => {});
    }
  }

  public playChip() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio context error ignore
    }
  }

  public playCountdownTick(isUrgent: boolean = false) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isUrgent ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 880 : 440, this.ctx.currentTime);

      gain.gain.setValueAtTime(isUrgent ? 0.3 : 0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  public playBowlOpen(step: number = 1) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      // Rising crisp chime as steps increase towards 12
      const baseFreq = 420 + step * 38;
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  public playReveal() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Magical shimmer sweep
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {}
  }

  public playWin() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Joyous victory fanfare
      const chords = [
        [523.25, 659.25, 783.99],
        [659.25, 830.61, 987.77],
        [783.99, 987.77, 1174.66],
        [1046.5, 1318.51, 1567.98],
      ];

      chords.forEach((chord, step) => {
        chord.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + step * 0.12);

          gain.gain.setValueAtTime(0.12, now + step * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + step * 0.12 + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + step * 0.12);
          osc.stop(now + step * 0.12 + 0.35);
        });
      });
    } catch {}
  }

  public playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {}
  }
}

export const soundManager = new SoundManager();
