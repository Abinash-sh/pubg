/**
 * High-performance procedural Web Audio API engine for 3D Jet Flight Combat.
 * Zero external audio files; 100% procedural sound synthesis.
 */
class GameAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private masterGain: GainNode | null = null;

  // Engine loop audio nodes
  private engineGain: GainNode | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineNoiseNode: AudioBufferSourceNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private afterburnerGain: GainNode | null = null;

  // Lock tone state
  private lockToneOsc: OscillatorNode | null = null;
  private lockToneGain: GainNode | null = null;
  private lastBeepTime = 0;

  // Warning alarm state
  private warningOsc: OscillatorNode | null = null;
  private warningGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Starts the continuous jet turbine engine sound loop
   */
  public startEngine() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.engineGain) return;

    try {
      const now = this.ctx.currentTime;

      // Master engine bus
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.2, now);
      this.engineGain.connect(this.masterGain);

      // Low rumble turbine core
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc1.type = 'triangle';
      this.engineOsc1.frequency.setValueAtTime(65, now);

      // High whine turbine compressor
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'sawtooth';
      this.engineOsc2.frequency.setValueAtTime(320, now);

      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.06, now);
      this.engineOsc2.connect(osc2Gain);

      // Procedural air rush noise
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      this.engineNoiseNode = this.ctx.createBufferSource();
      this.engineNoiseNode.buffer = noiseBuffer;
      this.engineNoiseNode.loop = true;

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(450, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);

      this.engineNoiseNode.connect(this.engineFilter);
      this.engineFilter.connect(noiseGain);

      // Afterburner roar layer
      this.afterburnerGain = this.ctx.createGain();
      this.afterburnerGain.gain.setValueAtTime(0.001, now);
      noiseGain.connect(this.afterburnerGain);
      this.afterburnerGain.connect(this.engineGain);

      this.engineOsc1.connect(this.engineGain);
      osc2Gain.connect(this.engineGain);
      noiseGain.connect(this.engineGain);

      this.engineOsc1.start(now);
      this.engineOsc2.start(now);
      this.engineNoiseNode.start(now);
    } catch {
      // AudioContext policy
    }
  }

  /**
   * Updates continuous engine pitch and afterburner based on throttle & boost
   */
  public updateEngineSound(throttle: number, isBoosting: boolean, speedNorm: number) {
    if (!this.ctx || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter) return;

    try {
      const now = this.ctx.currentTime;
      // Frequency ramps
      const baseFreq = 55 + throttle * 45 + (isBoosting ? 30 : 0);
      const whineFreq = 260 + throttle * 320 + (isBoosting ? 280 : 0);
      const filterFreq = 350 + throttle * 600 + (isBoosting ? 1200 : 0);

      this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.1);
      this.engineOsc2.frequency.setTargetAtTime(whineFreq, now, 0.1);
      this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.1);

      if (this.afterburnerGain) {
        const abGain = isBoosting ? 0.35 : 0.001;
        this.afterburnerGain.gain.setTargetAtTime(abGain, now, 0.08);
      }
    } catch {
      // AudioContext update fallback
    }
  }

  public stopEngine() {
    try {
      if (this.engineOsc1) {
        this.engineOsc1.stop();
        this.engineOsc1.disconnect();
        this.engineOsc1 = null;
      }
      if (this.engineOsc2) {
        this.engineOsc2.stop();
        this.engineOsc2.disconnect();
        this.engineOsc2 = null;
      }
      if (this.engineNoiseNode) {
        this.engineNoiseNode.stop();
        this.engineNoiseNode.disconnect();
        this.engineNoiseNode = null;
      }
      if (this.engineGain) {
        this.engineGain.disconnect();
        this.engineGain = null;
      }
      this.stopLockTone();
      this.stopWarningTone();
    } catch {
      // safe cleanup
    }
  }

  /**
   * Dual laser cannon blaster burst
   */
  public playLaserShot(isLeft: boolean = true) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const pitch = isLeft ? 1050 : 1120;
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.11);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // ignore
    }
  }

  /**
   * Homing missile launch whoosh & rocket ignition
   */
  public playMissileLaunch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;

      // Pneumatic launch hiss
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
    } catch {
      // ignore
    }
  }

  /**
   * Missile lock-on status tones
   */
  public updateLockTone(isLocking: boolean, isLocked: boolean) {
    if (this.isMuted || (!isLocking && !isLocked)) {
      this.stopLockTone();
      return;
    }
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = performance.now();

      if (isLocked) {
        // Continuous steady lock tone (2.4 kHz)
        if (!this.lockToneOsc) {
          this.lockToneOsc = this.ctx.createOscillator();
          this.lockToneGain = this.ctx.createGain();
          this.lockToneOsc.type = 'sine';
          this.lockToneOsc.frequency.setValueAtTime(2400, this.ctx.currentTime);
          this.lockToneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
          this.lockToneOsc.connect(this.lockToneGain);
          this.lockToneGain.connect(this.masterGain);
          this.lockToneOsc.start();
        }
      } else if (isLocking) {
        // Intermittent pulsing beeps
        this.stopLockTone();
        if (now - this.lastBeepTime > 180) {
          this.lastBeepTime = now;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1600, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.06);
        }
      }
    } catch {
      // ignore
    }
  }

  private stopLockTone() {
    if (this.lockToneOsc) {
      try {
        this.lockToneOsc.stop();
        this.lockToneOsc.disconnect();
      } catch {}
      this.lockToneOsc = null;
    }
    if (this.lockToneGain) {
      try {
        this.lockToneGain.disconnect();
      } catch {}
      this.lockToneGain = null;
    }
  }

  /**
   * Proximity / Terrain warning siren ("PULL UP")
   */
  public setWarningActive(active: boolean) {
    if (this.isMuted || !active) {
      this.stopWarningTone();
      return;
    }
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.warningOsc) return;

    try {
      this.warningOsc = this.ctx.createOscillator();
      this.warningGain = this.ctx.createGain();
      this.warningOsc.type = 'square';
      this.warningOsc.frequency.setValueAtTime(880, this.ctx.currentTime);

      // Alternating 880Hz / 440Hz alarm
      const now = this.ctx.currentTime;
      for (let t = 0; t < 6; t += 0.25) {
        this.warningOsc.frequency.setValueAtTime(t % 0.5 === 0 ? 880 : 550, now + t);
      }

      this.warningGain.gain.setValueAtTime(0.07, now);
      this.warningOsc.connect(this.warningGain);
      this.warningGain.connect(this.masterGain);
      this.warningOsc.start();
    } catch {
      // ignore
    }
  }

  private stopWarningTone() {
    if (this.warningOsc) {
      try {
        this.warningOsc.stop();
        this.warningOsc.disconnect();
      } catch {}
      this.warningOsc = null;
    }
    if (this.warningGain) {
      try {
        this.warningGain.disconnect();
      } catch {}
      this.warningGain = null;
    }
  }

  /**
   * Explosion impact sound (aircraft destroyed / boss hit)
   */
  public playExplosion(isLarge: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const duration = isLarge ? 1.4 : 0.8;

      // Sub-bass thump
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + duration);
      oscGain.gain.setValueAtTime(isLarge ? 0.45 : 0.28, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration);

      // Noise blast
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isLarge ? 900 : 1400, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + duration);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(isLarge ? 0.35 : 0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(now);
    } catch {
      // ignore
    }
  }

  /**
   * Stunt Ring passing bonus chime
   */
  public playRingPass() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.04);
        gain.gain.setValueAtTime(0.12, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + idx * 0.04);
        osc.start(now + idx * 0.04);
        osc.stop(now + 0.45);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Player shield hit feedback
   */
  public playPlayerHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // ignore
    }
  }

  /**
   * Sonic Boom supersonic shockwave crack & sub-bass rumble
   */
  public playSonicBoom() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // High-pressure shockwave crack
      const crackOsc = this.ctx.createOscillator();
      const crackGain = this.ctx.createGain();
      crackOsc.type = 'square';
      crackOsc.frequency.setValueAtTime(380, now);
      crackOsc.frequency.exponentialRampToValueAtTime(35, now + 0.25);
      crackGain.gain.setValueAtTime(0.5, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      crackOsc.connect(crackGain);
      crackGain.connect(this.masterGain);
      crackOsc.start(now);
      crackOsc.stop(now + 0.3);

      // Deep atmospheric reverberation
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(95, now);
      subOsc.frequency.exponentialRampToValueAtTime(25, now + 1.2);
      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 1.2);
    } catch {}
  }

  /**
   * M61 Vulcan 20mm Rotary Cannon cyclic fire (BRRRRRT)
   */
  public playRotaryVulcanCannon() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.05);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  /**
   * Pyrotechnic flare countermeasure ejection thump
   */
  public playFlareDeploy() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  /**
   * Stall Warning Klaxon ("STALL! STALL!")
   */
  private stallOsc: OscillatorNode | null = null;
  private stallGain: GainNode | null = null;

  public setStallAlarm(active: boolean) {
    if (this.isMuted || !active) {
      if (this.stallOsc) {
        try {
          this.stallOsc.stop();
          this.stallOsc.disconnect();
        } catch {}
        this.stallOsc = null;
      }
      return;
    }
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.stallOsc) return;

    try {
      const now = this.ctx.currentTime;
      this.stallOsc = this.ctx.createOscillator();
      this.stallGain = this.ctx.createGain();
      this.stallOsc.type = 'sawtooth';

      // Harsh dual-frequency horn (740Hz / 490Hz alternating)
      for (let t = 0; t < 8; t += 0.2) {
        this.stallOsc.frequency.setValueAtTime(t % 0.4 === 0 ? 740 : 490, now + t);
      }

      this.stallGain.gain.setValueAtTime(0.09, now);
      this.stallOsc.connect(this.stallGain);
      this.stallGain.connect(this.masterGain);
      this.stallOsc.start(now);
    } catch {}
  }

  /**
   * Hostile missile lock & incoming tracking alarm
   */
  private missileAlarmOsc: OscillatorNode | null = null;
  private missileAlarmGain: GainNode | null = null;

  public setMissileInboundAlarm(active: boolean) {
    if (this.isMuted || !active) {
      if (this.missileAlarmOsc) {
        try {
          this.missileAlarmOsc.stop();
          this.missileAlarmOsc.disconnect();
        } catch {}
        this.missileAlarmOsc = null;
      }
      return;
    }
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.missileAlarmOsc) return;

    try {
      const now = this.ctx.currentTime;
      this.missileAlarmOsc = this.ctx.createOscillator();
      this.missileAlarmGain = this.ctx.createGain();
      this.missileAlarmOsc.type = 'sine';

      // Urgent high-pitch warble (2800Hz - 3400Hz rapid chirps)
      for (let t = 0; t < 10; t += 0.08) {
        this.missileAlarmOsc.frequency.setValueAtTime(t % 0.16 === 0 ? 3200 : 2600, now + t);
      }

      this.missileAlarmGain.gain.setValueAtTime(0.12, now);
      this.missileAlarmOsc.connect(this.missileAlarmGain);
      this.missileAlarmGain.connect(this.masterGain);
      this.missileAlarmOsc.start(now);
    } catch {}
  }

  /**
   * Atmospheric Thunderclap for Thunderstorm weather
   */
  public playThunder() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 2.5;

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + duration);
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }
}

export const gameAudio = new GameAudioEngine();

