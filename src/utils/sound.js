/**
 * Plays a soft and pleasing beep sound using Web Audio API
 * Used to notify user of successful scan
 */
export const playScanSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5

        // Soft envelope for pleasing sound
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); // Decay

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
        console.error("Failed to play scan sound:", error);
    }
};
