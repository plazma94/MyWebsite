Optional poster images (single-frame JPG/PNG) are useful as fallbacks and for initial page load.

Name them:
- Video_Intro.jpg
- Video_1.jpg
- Videos_2.jpg
- Videos_3.jpg
- Video_4.jpg

Create with ffmpeg:
ffmpeg -ss 00:00:01 -i input.mp4 -frames:v 1 -q:v 2 scene-01.jpg