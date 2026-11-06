import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { FFMPEG, REPORT_DIR } from './env';

/** แปลงวิดีโอ webm ของ Playwright เป็น MP4 + GIF ด้วย ffmpeg */
export function convertVideo(webm: string, tcId: string): { mp4: string; gif: string } {
  const mp4 = path.join(REPORT_DIR, 'videos', `${tcId}.mp4`);
  const gif = path.join(REPORT_DIR, 'gifs', `${tcId}.gif`);
  fs.mkdirSync(path.dirname(mp4), { recursive: true });
  fs.mkdirSync(path.dirname(gif), { recursive: true });
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', mp4]);
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', webm, '-vf',
    'fps=6,scale=760:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse', gif]);
  return { mp4, gif };
}
