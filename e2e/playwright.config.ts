import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { BASE_URL, IS_GIF, REPORT_DIR } from './support/env';

/** แต่ละรอบเก็บผล JSON แยกไฟล์ไว้เทียบกัน */
const RUN_ID = process.env.RUN_ID ?? `${IS_GIF ? 'gif' : 'run'}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
process.env.RUN_ID = RUN_ID;

/** Chromium headless ซ่อน scrollbar โดยปริยาย — เปิดกลับให้เหมือน Chrome ที่ใช้ตอนสำรวจ (วัด Scroll แนวนอนได้ตรง) */
const chromiumLaunch = { ignoreDefaultArgs: ['--hide-scrollbars'] };

const common = {
  baseURL: BASE_URL,
  locale: 'th-TH',
  timezoneId: 'Asia/Bangkok',
  viewport: { width: 1280, height: 800 },
  screenshot: 'only-on-failure' as const,
  trace: 'retain-on-failure' as const,
};

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  // ข้อมูล/เวลาใช้ร่วมกันทั้งระบบ (reset ก่อนทุก test) — ห้ามรันขนาน
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: IS_GIF ? 180_000 : 60_000,
  expect: { timeout: 10_000 },
  outputDir: path.join(REPORT_DIR, 'artifacts', RUN_ID),
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(REPORT_DIR, 'runs', `${RUN_ID}.json`) }],
  ],
  use: common,
  projects: IS_GIF
    ? [
        {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
            ...common,
            video: { mode: 'on', size: { width: 1280, height: 800 } },
            launchOptions: { ...chromiumLaunch, slowMo: 400 },
          },
        },
      ]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'], ...common, launchOptions: chromiumLaunch } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'], ...common } },
        { name: 'webkit', use: { ...devices['Desktop Safari'], ...common } },
      ],
});

