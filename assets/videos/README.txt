Place your video files here. Recommended filenames:

Video_Intro.mp4   (intro)
Video_1.mp4
Video_2.mp4
Video_3.mp4
Video_4.mp4

Encoding tips:
- Use ffmpeg, set GOP (-g) small (e.g. -g 15 at 30fps) for smoother seeking.
- Example command:
  ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 20 -g 15 -sc_threshold 0 -c:a none -movflags +faststart scene-01.mp4