# Original promotional film

Output: `media/frontend-style-discovery.mp4`; 32 seconds, 1280×720, 24 fps, H.264/AAC. `media/video-metadata.json` records the completed render. Scene geometry, camera animation, typography and audio are original. KODE, Lusion and Igloo are credited inspiration sources, not footage providers or endorsers.

| Time    | Scene                                                       | Message                                                 |
| ------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| 0–5 s   | Close view of glass core and copper ring                    | Choose style before coding                              |
| 5–10 s  | Creator names over the original scene                       | Find real references with stable IDs                    |
| 10–16 s | Floating property labels                                    | Select scene, materials, layout and color independently |
| 16–24 s | Dark-to-daylight material transition with original concepts | Revise from concrete feedback                           |
| 24–32 s | Daylight pavilion and project address                       | Selected design continues into implementation           |

Reproduction requires Node 20+, the package dependencies, Playwright Chromium and FFmpeg:

```sh
npm ci
npx playwright install chromium
python3 scripts/make-sound.py
npm run video
```

Set `FFMPEG_PATH` and/or `CHROMIUM_PATH` if the executables are not at their defaults. The renderer starts its own loopback server, renders deterministic frames and closes it afterward. The regular showcase is interactive and does not automatically play the film.

To keep software rendering practical, the exporter captures at 8 fps with the WebGL scene at half resolution; text remains at the full output resolution. FFmpeg motion interpolation produces the 24 fps output, with scene-change detection for title cuts. The metadata distinguishes captured frames from output frames. This is an original procedural showcase, rather than photorealistic footage from the reference studios.

The Python audio generator uses only the standard library. It creates a soft stereo tone bed and short selection sounds, without sampled music. No voiceover or third-party audio is used. Inspect the film with sound and review the five saved keyframes before publishing.
