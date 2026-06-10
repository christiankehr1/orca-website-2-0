# Sonar Walkthrough — narration

The video (`Sonar Walkthrough.html`) plays on its own clock with captions. To add
your voiceover, generate an MP3 from ElevenLabs and drop it in **next to the HTML**
as **`narration.mp3`** — the video auto-detects it and stays in sync (scrub, pause,
loop all stay locked to the audio). A "Click for sound" chip appears; one click
starts playback with audio (browsers require a click before audio can play).

- **Voice:** `n9RJRb8CoeRtSYSpKZRH`
- **Target length:** ~28–30 seconds, calm/measured pace
- **File name:** `narration.mp3`  →  save to `sonar-demo/narration.mp3`

## Script (matches the on-screen captions & beat timing)

> This is Sonar — ORCA's AI document reader. Drop in any legal document: a share
> purchase agreement, a trust deed, a share register. Sonar reads it in seconds,
> pulling out every entity, date, owner and value — each one linked back to the
> exact words in the source. You don't type anymore. You just check. One click
> files it all to Smart Folders. Less admin. More business.

If your generated audio is a little shorter or longer than 30s, tell me and I'll
nudge the beat timings in `VideoScene.jsx` to line up exactly.
