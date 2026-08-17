(function(window, document){
  var AudioEngine = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),
    isUnlocked: false,
    STRUM_INTERVAL: 0.14,
    SOUND_DURATION: 3.05,
    ATTACK_TIME: 0.015,
    DECAY_VOLUME: 0.0001,

    init: function() {
      var self = this;
      ['pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach(function(evt){
        document.addEventListener(evt, function() { self.unlock(); }, { capture: true, once: true, passive: true });
      });
    },

    getContext: function() {
      if (this.ctx.state === 'suspended') { this.ctx.resume(); }
      return this.ctx;
    },

    unlock: function() {
      if (this.isUnlocked) return;
      try {
        var ctx = this.getContext();
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.001);
        this.isUnlocked = true;
      } catch(e) {}
    },

    playNote: function(freq, startTime) {
      var ctx = this.getContext();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(1.3, startTime + this.ATTACK_TIME);
      gain.gain.exponentialRampToValueAtTime(this.DECAY_VOLUME, startTime + this.SOUND_DURATION);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + this.SOUND_DURATION);
    },

    playSequence: function(freqs) {
      var ctx = this.getContext();
      var now = ctx.currentTime;
      var self = this;
      freqs.forEach(function(freq, i) {
        self.playNote(freq, now + i * self.STRUM_INTERVAL);
      });
    }
  };

  window.AudioEngine = AudioEngine;
  window.getAudioCtx = function() { return AudioEngine.getContext(); };
  window.playStrumNoteAt = function(freq, startTime) { AudioEngine.playNote(freq, startTime); };
  window.playStrumSequence = function(freqs) { AudioEngine.playSequence(freqs); };
  window.playStrum = function() { AudioEngine.playSequence([196.00, 196.00, 246.94, 146.83]); };
  window.playStrumReverse = function() { AudioEngine.playSequence([146.83, 246.94, 196.00, 196.00]); };

  AudioEngine.init();
})(window, document);
