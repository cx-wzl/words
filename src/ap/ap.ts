import { Express } from 'express';
import multer from 'multer';
import { wordScore } from './word';

const upload = multer({ storage: multer.memoryStorage() });

export function apiPost(app: Express) {
  app.post(
    '/api/word/score',
    upload.single('audio'),
    async (req, res) => await wordScore(req, res),
  );
}
