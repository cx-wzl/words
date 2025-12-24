import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

import { readFile, writeFile } from 'node:fs/promises';

// 获取所有 bookcase 列表（带路径信息）
app.get('/api/bookcases', async (req, res) => {
  try {
    const bookcaseJsonPath = join(browserDistFolder, 'bookcase/bookcase.json');
    const data = await readFile(bookcaseJsonPath, 'utf-8');
    const bookcases = JSON.parse(data);

    // 从 image 路径中提取 folder 名称
    const bookcasesWithPath = bookcases.map(
      (book: { title: string; subTitle: string; image: string }) => {
        const imagePath = book.image;
        // image 格式: "bookcase/power_up_level_0/image.png"
        const folder = imagePath.split('/')[1];
        return { ...book, folder };
      }
    );

    res.json(bookcasesWithPath);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load bookcases' });
  }
});

// 获取指定 bookcase 的单词列表
app.get('/api/bookcase-words/:folder', async (req, res) => {
  try {
    const folder = req.params.folder;
    const dictPath = join(browserDistFolder, `bookcase/${folder}/dict.json`);
    const data = await readFile(dictPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load words' });
  }
});

// 添加单词到指定 bookcase
app.use(express.json());

app.post('/api/bookcase-words/:folder/add', async (req, res) => {
  try {
    const folder = req.params.folder;
    const { word, lesson = 1, unit = 1 } = req.body;
    const dictPath = join(browserDistFolder, `bookcase/${folder}/dict.json`);

    const data = await readFile(dictPath, 'utf-8');
    const words = JSON.parse(data);

    // 检查单词是否已存在
    const exists = words.some((w: { word: string }) => w.word.toLowerCase() === word.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'Word already exists' });
    }

    words.push({ word, lesson, unit });
    await writeFile(dictPath, JSON.stringify(words, null, 2));

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add word' });
  }
});

// 从指定 bookcase 删除单词
app.post('/api/bookcase-words/:folder/remove', async (req, res) => {
  try {
    const folder = req.params.folder;
    const { word } = req.body;
    const dictPath = join(browserDistFolder, `bookcase/${folder}/dict.json`);

    const data = await readFile(dictPath, 'utf-8');
    let words = JSON.parse(data);

    const initialLength = words.length;
    words = words.filter((w: { word: string }) => w.word.toLowerCase() !== word.toLowerCase());

    if (words.length === initialLength) {
      return res.status(404).json({ error: 'Word not found' });
    }

    await writeFile(dictPath, JSON.stringify(words, null, 2));

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove word' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    cacheControl: false,
    index: false,
    redirect: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    },
  })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
