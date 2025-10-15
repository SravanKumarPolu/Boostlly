#!/usr/bin/env node

/**
 * Generate simple sound files for the Boostlly app
 * This creates basic audio files that can be used with Howler.js
 */

const fs = require("fs");
const path = require("path");

// Ensure sounds directory exists
const soundsDir = path.join(__dirname, "../assets/sounds");
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Create a simple HTML file that generates sounds using Web Audio API
const soundGeneratorHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Sound Generator</title>
</head>
<body>
  <h1>Boostlly Sound Generator</h1>
  <p>This page generates the sound files needed for Boostlly.</p>
  <button onclick="generateSounds()">Generate Sounds</button>
  <div id="status"></div>

  <script>
    function generateSounds() {
      const status = document.getElementById('status');
      status.innerHTML = 'Generating sounds...';
      
      // Generate crystal chime
      generateCrystalChime();
      
      // Generate soft bell
      generateSoftBell();
      
      // Generate beep
      generateBeep();
      
      status.innerHTML = 'Sounds generated! Check the console for download links.';
    }
    
    function generateCrystalChime() {
      const audioContext = new AudioContext();
      const sampleRate = audioContext.sampleRate;
      const duration = 0.5; // 500ms
      const length = sampleRate * duration;
      const buffer = audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate crystal chime (high frequency sine wave with decay)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const frequency = 800 + Math.sin(t * 20) * 100; // Vibrato effect
        const amplitude = Math.exp(-t * 3); // Exponential decay
        data[i] = Math.sin(2 * Math.PI * frequency * t) * amplitude * 0.3;
      }
      
      // Convert to WAV and download
      const wav = audioBufferToWav(buffer);
      downloadBlob(wav, 'crystal-chime.wav');
    }
    
    function generateSoftBell() {
      const audioContext = new AudioContext();
      const sampleRate = audioContext.sampleRate;
      const duration = 0.3; // 300ms
      const length = sampleRate * duration;
      const buffer = audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate soft bell (triangle wave with harmonics)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const frequency = 600;
        const amplitude = Math.exp(-t * 4);
        
        // Fundamental + harmonics
        let sample = 0;
        sample += Math.sin(2 * Math.PI * frequency * t) * 0.5;
        sample += Math.sin(2 * Math.PI * frequency * 2 * t) * 0.3;
        sample += Math.sin(2 * Math.PI * frequency * 3 * t) * 0.2;
        
        data[i] = sample * amplitude * 0.3;
      }
      
      const wav = audioBufferToWav(buffer);
      downloadBlob(wav, 'soft-bell.wav');
    }
    
    function generateBeep() {
      const audioContext = new AudioContext();
      const sampleRate = audioContext.sampleRate;
      const duration = 0.1; // 100ms
      const length = sampleRate * duration;
      const buffer = audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate simple beep (square wave)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const frequency = 1000;
        data[i] = Math.sign(Math.sin(2 * Math.PI * frequency * t)) * 0.3;
      }
      
      const wav = audioBufferToWav(buffer);
      downloadBlob(wav, 'beep.wav');
    }
    
    function audioBufferToWav(buffer) {
      const length = buffer.length;
      const arrayBuffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(arrayBuffer);
      
      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, buffer.sampleRate, true);
      view.setUint32(28, buffer.sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * 2, true);
      
      // Convert float samples to 16-bit PCM
      const channelData = buffer.getChannelData(0);
      let offset = 44;
      for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
      
      return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
    
    function downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Downloaded:', filename);
    }
  </script>
</body>
</html>
`;

// Write the sound generator HTML
fs.writeFileSync(
  path.join(soundsDir, "sound-generator.html"),
  soundGeneratorHTML,
);

// Create a README for the sounds directory
const readmeContent = `# Boostlly Sound Assets

This directory contains sound files for the Boostlly app.

## Required Files

- \`crystal-chime.mp3\` - Gentle chime for daily quotes
- \`crystal-chime.ogg\` - OGG version for better browser support
- \`soft-bell.mp3\` - Soft bell for notifications
- \`soft-bell.ogg\` - OGG version
- \`beep.mp3\` - Simple beep for alerts
- \`beep.ogg\` - OGG version

## Generating Sounds

1. Open \`sound-generator.html\` in a web browser
2. Click "Generate Sounds" button
3. Download the generated WAV files
4. Convert WAV to MP3 and OGG using an online converter or ffmpeg

## Fallback

If sound files are not available, the app will use WebAudio synthesis as a fallback.

## Usage

The sound system is implemented in \`packages/core/src/utils/sound-manager.ts\` and can be used with:

\`\`\`typescript
import { playSound } from '@boostlly/core';

// Play a sound
await playSound('crystal-chime', 70); // 70% volume
\`\`\`
`;

fs.writeFileSync(path.join(soundsDir, "README.md"), readmeContent);

console.log("Sound generator created!");
console.log("1. Open assets/sounds/sound-generator.html in a browser");
console.log('2. Click "Generate Sounds" to create WAV files');
console.log("3. Convert WAV files to MP3 and OGG formats");
console.log("4. Place the converted files in this directory");
