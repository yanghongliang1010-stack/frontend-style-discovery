#!/usr/bin/env python3
"""Original 32-second ambient score and selection clicks, using only Python stdlib."""
import math
import random
import struct
import wave
from pathlib import Path

rate, duration = 44100, 32
random.seed(41)
output = Path(__file__).resolve().parents[1] / 'media' / 'original-sound.wav'
output.parent.mkdir(exist_ok=True)
notes = [146.83, 220.0, 293.66, 349.23]
clicks = [5.1, 10.1, 13.0, 16.1, 20.0, 24.1, 28.0]
with wave.open(str(output), 'wb') as audio:
    audio.setparams((2, 2, rate, 0, 'NONE', 'not compressed'))
    chunk = bytearray()
    for i in range(rate * duration):
        t = i / rate
        envelope = min(1, t / 2.5, (duration - t) / 2.5)
        left = sum(math.sin(2 * math.pi * note * t + .13 * math.sin(t * .27)) / (j + 3) for j, note in enumerate(notes)) * .095
        right = sum(math.sin(2 * math.pi * (note + .16) * t + .11 * math.sin(t * .22)) / (j + 3) for j, note in enumerate(notes)) * .095
        for onset in clicks:
            dt = t - onset
            if 0 <= dt < .16:
                pulse = math.sin(2 * math.pi * (840 - dt * 2500) * dt) * math.exp(-dt * 40) * .055
                left += pulse; right += pulse
        for value in [left * envelope, right * envelope]:
            chunk.extend(struct.pack('<h', int(max(-1, min(1, value)) * 32767)))
        if len(chunk) >= 65536:
            audio.writeframes(chunk); chunk.clear()
    audio.writeframes(chunk)
print(output.name)
