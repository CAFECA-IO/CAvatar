import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const IMAGE_DIR = path.join(process.cwd(), 'public/avatars');
const TMP_DIR = path.join(process.cwd(), 'tmp');

export async function GET() {
  // Info: (20251020 - Luphia) 取得 public 資料夾所有圖片
  const files = await fs.readdir(IMAGE_DIR);
  const imageFiles = files.filter(f => f.match(/\.(png|jpg|jpeg|svg)$/i));
  if (imageFiles.length === 0) {
    return NextResponse.json({ error: 'Try again later' }, { status: 404 });
  }
  // Info: (20251020 - Luphia) 隨機選擇一張
  const randomFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];
  const srcPath = path.join(IMAGE_DIR, randomFile);
  const randomId = Date.now().toString();
  const destPath = path.join(TMP_DIR, randomId);
  // Info: (20251020 - Luphia) 將檔案搬移到 tmp 資料夾
  await fs.rename(srcPath, destPath);
  // Info: (20251020 - Luphia) 讀取檔案內容
  const imageBuffer = await fs.readFile(destPath);
  // Info: (20251020 - Luphia) 根據副檔名決定 Content-Type
  let contentType = 'application/octet-stream';
  if (randomFile.endsWith('.png')) contentType = 'image/png';
  else if (randomFile.endsWith('.jpg') || randomFile.endsWith('.jpeg')) contentType = 'image/jpeg';
  else if (randomFile.endsWith('.svg')) contentType = 'image/svg+xml';
  // Info: (20251020 - Luphia) 回傳圖片 (Buffer 轉 Uint8Array)
  return new Response(new Uint8Array(imageBuffer), {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename=\"${randomFile}\"`,
    },
  });
}
