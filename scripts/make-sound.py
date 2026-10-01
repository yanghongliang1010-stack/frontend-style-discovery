#!/usr/bin/env python3
"""Compose an original 96 BPM electronic score; no samples or third-party music."""
import math
import random
import struct
import wave
from array import array
from pathlib import Path

RATE, DURATION, BPM = 44100, 32, 96
BEAT = 60 / BPM
random.seed(41)
left = array('f', [0.0]) * (RATE * DURATION)
right = array('f', [0.0]) * (RATE * DURATION)


def hz(note):
    return 440 * 2 ** ((note - 69) / 12)


def mix(onset, length, voice, gain, pan=0):
    start = int(onset * RATE)
    count = min(int(length * RATE), len(left) - start)
    l_gain, r_gain = math.sqrt((1 - pan) / 2), math.sqrt((1 + pan) / 2)
    for i in range(max(0, count)):
        value = voice(i / RATE) * gain
        left[start+i] += value * l_gain
        right[start+i] += value * r_gain


def keys(note, length):
    freq = hz(note)
    def voice(t):
        env = min(1, t / .012) * math.exp(-t * 2.3) * min(1, (length - t) / .12)
        return env * (math.sin(math.tau * freq * t) + .22 * math.sin(math.tau * freq * 2 * t) + .08 * math.sin(math.tau * freq * 3 * t))
    return voice


def pad(notes, length):
    freqs = [hz(n) for n in notes]
    def voice(t):
        env = min(1, t / .35, (length - t) / .45)
        return env * sum(math.sin(math.tau * f * t + .1 * math.sin(t * .9)) + .22 * math.sin(math.tau * f * 1.002 * t) for f in freqs) / len(freqs)
    return voice


def bass(note, length):
    f = hz(note)
    return lambda t: min(1, t/.012, (length-t)/.07) * math.exp(-t*2) * (math.sin(math.tau*f*t) + .25*math.sin(math.tau*f*2*t))


def kick(t):
    # Integrated exponential frequency sweep: 110 Hz down to a 45 Hz body.
    phase = math.tau * (45*t + 65/30 * (1-math.exp(-30*t)))
    return math.sin(phase) * math.exp(-t*11) + .05 * random.uniform(-1, 1) * math.exp(-t*160)


def snare(t):
    return .7 * random.uniform(-1, 1) * math.exp(-t*22) + .25 * math.sin(math.tau*185*t) * math.exp(-t*18)


def hat(t):
    return random.uniform(-1, 1) * math.exp(-t*100) * min(1, t/.002)


# D minor → B-flat major → F major → C suspended. The melody is original.
chords = [[62,65,69,72], [58,62,65,69], [60,65,69,72], [60,62,67,72]]
roots = [38,34,41,36]
melody = [[74,None,77,76,None,72,69,None], [74,None,77,None,81,77,74,None], [77,None,79,81,None,77,76,None], [79,77,None,74,72,None,69,None]]
for bar in range(12):
    onset = bar * 4 * BEAT
    chord = chords[bar % 4]
    mix(onset, 4*BEAT+.3, pad(chord, 4*BEAT+.3), .15, -.25)
    mix(onset+.02, 4*BEAT+.3, pad([n+12 for n in chord], 4*BEAT+.3), .065, .35)
    for beat in range(4):
        t = onset + beat * BEAT
        if bar >= 1:
            mix(t, .48, kick, .42)
            mix(t, BEAT*.7, bass(roots[bar % 4], BEAT*.7), .2)
        if beat in [1,3] and bar >= 2:
            mix(t, .2, snare, .11, .12)
        if bar >= 2:
            mix(t+BEAT/2, .08, hat, .075, -.25 if beat%2 else .25)
    for step, note in enumerate(melody[bar % 4]):
        if note is not None:
            t=onset+step*BEAT/2
            voice=keys(note, .95)
            mix(t, .95, voice, .095, -.15)
            mix(t+BEAT*.75, .95, voice, .027, .65)
            mix(t+BEAT*1.5, .95, voice, .011, -.6)
# A resolving final chord and gentle chapter accents.
mix(30, 2, pad([62,65,69,74], 2), .22)
for t in [5,10,16,24]:
    mix(t, 1.1, keys(86,1.1), .065, .3)

output = Path(__file__).resolve().parents[1] / 'media' / 'original-sound.wav'
output.parent.mkdir(exist_ok=True)
peak = max(max(abs(v) for v in left), max(abs(v) for v in right))
gain = .82 / max(peak, .001)
with wave.open(str(output), 'wb') as audio:
    audio.setparams((2,2,RATE,0,'NONE','not compressed'))
    chunk = bytearray()
    for i in range(len(left)):
        t=i/RATE
        fade=min(1,t/.6,(DURATION-t)/1.8)
        for track in [left,right]:
            chunk.extend(struct.pack('<h',int(max(-1,min(1,track[i]*gain*fade))*32767)))
        if len(chunk)>=65536:
            audio.writeframes(chunk);chunk.clear()
    audio.writeframes(chunk)
print(f'{output.name}: {DURATION}s, {BPM} BPM, original melody/chords/bass/drums, stereo')
