/**
 * Procedural Web Audio API sound generator for PUBG Battle Royale.
 * 100% synthesized in real time — zero external audio files.
 */
class PubgAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted = false;

  // Vehicle engine sound nodes
  private vehicleOsc: OscillatorNode | null = null;
  private vehicleGain: GainNode | null = null;
  private vehicleFilter: BiquadFilterNode | null = null;

  // Zone hum
  private zoneOsc: OscillatorNode | null = null;
  private zoneGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
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
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.75, this.ctx.currentTime);
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Helper: generate white noise buffer
   */
  private createNoiseBuffer(duration = 0.5): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Gunshot sounds for distinct weapons
   */
  public playGunshot(type: string, isSuppressed = false, distanceFactor = 1.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const vol = Math.max(0.05, Math.min(1.0, 1.0 / distanceFactor));

    const shotGain = this.ctx.createGain();
    shotGain.gain.setValueAtTime(vol, now);
    shotGain.connect(this.masterGain);

    if (type === 'M416') {
      // Crisp 5.56mm assault rifle report
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(oscGain);
      oscGain.connect(shotGain);
      osc.start(now);
      osc.stop(now + 0.15);

      // Noise crack
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.2);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isSuppressed ? 800 : 2200, now);
      filter.Q.value = 2.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(isSuppressed ? 0.3 : 0.85, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      if (noise.buffer) {
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(shotGain);
        noise.start(now);
        noise.stop(now + 0.2);
      }
    } else if (type === 'AKM') {
      // Heavy 7.62mm punchy crack & deep body
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);
      oscGain.gain.setValueAtTime(0.9, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(oscGain);
      oscGain.connect(shotGain);
      osc.start(now);
      osc.stop(now + 0.22);

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.28);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.95, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      if (noise.buffer) {
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(shotGain);
        noise.start(now);
        noise.stop(now + 0.28);
      }
    } else if (type === 'AWM') {
      // Thunderous .300 Magnum sniper rifle cannon-like report
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.35);
      oscGain.gain.setValueAtTime(1.0, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(oscGain);
      oscGain.connect(shotGain);
      osc.start(now);
      osc.stop(now + 0.52);

      // Long environmental reverb tail
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.65);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.value = 1.2;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(1.0, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      if (noise.buffer) {
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(shotGain);
        noise.start(now);
        noise.stop(now + 0.65);
      }
    } else if (type === 'S12K') {
      // Multi-pellet concussive shotgun blast
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.35);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(1.0, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      if (noise.buffer) {
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(shotGain);
        noise.start(now);
        noise.stop(now + 0.35);
      }
    } else if (type === 'SCAR_L') {
      // Solid rhythmic 5.56 NATO report
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.13);
      oscGain.gain.setValueAtTime(0.75, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(oscGain);
      oscGain.connect(shotGain);
      osc.start(now);
      osc.stop(now + 0.16);

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.22);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2100, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.85, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      if (noise.buffer) {
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(shotGain);
        noise.start(now);
        noise.stop(now + 0.22);
      }
    } else if (type === 'KAR98K') {
      // Resounding vintage bolt rifle crack
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.28);
      oscGain.gain.setValueAtTime(0.95, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(oscGain);
      oscGain.connect(shotGain);
      osc.start(now);
      osc.stop(now + 0.35);

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.45);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.95, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      if (noise.buffer) {
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(shotGain);
        noise.start(now);
        noise.stop(now + 0.45);
      }
    } else if (type === 'M249') {
      // Heavy rapid SAW machine gun thumping
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(230, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.1);
      oscGain.gain.setValueAtTime(0.85, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(oscGain);
      oscGain.connect(shotGain);
      osc.start(now);
      osc.stop(now + 0.12);

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.18);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.9, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      if (noise.buffer) {
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(shotGain);
        noise.start(now);
        noise.stop(now + 0.18);
      }
    } else if (type === 'VECTOR') {
      // Blisteringly high 1200 RPM buzz saw clatter
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.06);
      oscGain.gain.setValueAtTime(0.65, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(oscGain);
      oscGain.connect(shotGain);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'UMP45') {
      // Thumping .45 ACP submachine gun
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.11);
      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(oscGain);
      oscGain.connect(shotGain);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'DEAGLE') {
      // Massive .50 Action Express cannon blast
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);
      oscGain.gain.setValueAtTime(1.0, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(oscGain);
      oscGain.connect(shotGain);
      osc.start(now);
      osc.stop(now + 0.3);

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.38);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(1.0, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      if (noise.buffer) {
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(shotGain);
        noise.start(now);
        noise.stop(now + 0.38);
      }
    } else {
      // Pistol / Default report
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
      oscGain.gain.setValueAtTime(0.6, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(oscGain);
      oscGain.connect(shotGain);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  }

  /**
   * Cash register / Battle Points buy sound
   */
  public playBuyChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.setValueAtTime(1320, now + 0.08);
    osc2.frequency.setValueAtTime(1760, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now + 0.08);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  /**
   * Reload weapon sounds
   */
  public playReloadSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Click 1: Mag out
    this.playClick(now, 600, 0.04);
    // Click 2: Mag in
    this.playClick(now + 0.65, 850, 0.05);
    // Click 3: Bolt slide forward
    this.playClick(now + 1.25, 1200, 0.07);
  }

  private playClick(time: number, freq: number, dur: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + dur);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  /**
   * Hit Marker feedback
   */
  public playHitMarker(isHeadshot = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isHeadshot) {
      // High-pitched satisfying metallic ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.setValueAtTime(2200, now + 0.04);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.18);
    } else {
      // Punchy body thud
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.07);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
  }

  /**
   * Footstep sound
   */
  public playFootstep(isSprinting = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.06);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400 + Math.random() * 200, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isSprinting ? 0.35 : 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    if (noise.buffer) {
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.07);
    }
  }

  /**
   * Frag Grenade explosion
   */
  public playExplosion(dist = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const vol = Math.max(0.1, Math.min(1.0, 1.2 / dist));

    // Heavy concussive low rumble
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.7);
    oscGain.gain.setValueAtTime(vol * 1.0, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.85);

    // Blast noise
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.9);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(vol * 0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    if (noise.buffer) {
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.9);
    }
  }

  /**
   * Loot pickup sound
   */
  public playPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * Meds / Energy drink consumed
   */
  public playConsume() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Can crack / zipper
    this.playClick(now, 1400, 0.03);
    // Gulp / heal chime
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.2);
    gain.gain.setValueAtTime(0.3, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now + 0.06);
    osc.stop(now + 0.26);
  }

  /**
   * Zone siren warning
   */
  public playZoneSiren() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(660, now + 0.4);
    osc.frequency.linearRampToValueAtTime(440, now + 0.8);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.05);
  }

  /**
   * Vehicle engine update
   */
  public updateVehicleEngine(active: boolean, speedKmh: number) {
    if (this.isMuted || !active) {
      if (this.vehicleOsc) {
        try {
          this.vehicleOsc.stop();
          this.vehicleOsc.disconnect();
        } catch (_) {}
        this.vehicleOsc = null;
        this.vehicleGain = null;
      }
      return;
    }

    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const targetFreq = 50 + Math.min(speedKmh * 2.4, 260);

    if (!this.vehicleOsc) {
      this.vehicleOsc = this.ctx.createOscillator();
      this.vehicleOsc.type = 'sawtooth';
      this.vehicleGain = this.ctx.createGain();
      this.vehicleFilter = this.ctx.createBiquadFilter();
      this.vehicleFilter.type = 'lowpass';
      this.vehicleFilter.frequency.setValueAtTime(420, now);

      this.vehicleOsc.connect(this.vehicleFilter);
      this.vehicleFilter.connect(this.vehicleGain);
      this.vehicleGain.connect(this.masterGain);

      this.vehicleGain.gain.setValueAtTime(0.2, now);
      this.vehicleOsc.frequency.setValueAtTime(targetFreq, now);
      this.vehicleOsc.start();
    } else if (this.vehicleOsc && this.vehicleGain) {
      this.vehicleOsc.frequency.setTargetAtTime(targetFreq, now, 0.05);
      this.vehicleGain.gain.setTargetAtTime(0.25, now, 0.1);
    }
  }

  /**
   * Winner Winner Chicken Dinner Fanfare!
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // C major chord arpeggio
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.12;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.85);
    });
  }
}

export const pubgAudio = new PubgAudioEngine();
