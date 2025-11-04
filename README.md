```markdown
# MyWebsite — Scroll-scrubbed Video Scenes (starter)

This is a small starter project for a scroll-driven, scrubbed-video site using GSAP + ScrollTrigger.
It includes 5 scenes (1 intro + 4 selectable scenes via the compass). Replace the sample videos with your own.

Folder structure (what to put where)
MyWebsite/
├─ index.html
├─ styles/
│  └─ styles.css
├─ js/
│  └─ script.js
├─ assets/
│  ├─ videos/
│  │  └─ README.txt (place your MP4/WebM files here)
│  └─ posters/
│     └─ README.txt (optional poster images)
├─ .gitignore
├─ package.json (optional)
└─ README.md

Videos
- Put your video files in assets/videos/ named:
  - scene-01.mp4  (intro)
  - scene-02.mp4  (scene 2)
  - scene-03.mp4  (scene 3)
  - scene-04.mp4  (scene 4)
  - scene-05.mp4  (scene 5)

- It's recommended to also create webm variants (scene-01.webm ...) and posters (scene-01.jpg ...).
- Use ffmpeg to encode with frequent keyframes (GOP) to make seeking/scrubbing smooth. Example:
  ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 20 -g 15 -sc_threshold 0 -c:a none -movflags +faststart scene-01.mp4

How to create a WinRAR archive (MyWebsite)
1. Create a folder named `MyWebsite`.
2. Copy the files and folders listed above into it.
3. Right-click the `MyWebsite` folder -> "Add to archive..."
4. Choose Archive format: RAR or ZIP, set name `MyWebsite.rar` (or MyWebsite.zip), click OK.

Local testing
- Use a simple local server (recommended; do not open index.html via file://).
- If you have npm: `npx http-server . -p 8080` inside MyWebsite and visit http://localhost:8080
- Or open with VS Code Live Server extension.

Next steps
- Replace placeholder videos with your own files.
- Tweak the timeline length or per-scene tail values in the HTML (data-loop-tail attribute).
- Adjust visuals and overlays in CSS.
```