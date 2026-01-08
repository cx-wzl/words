import { Request, Response } from 'express';

export async function wordScore(req: Request, res: Response) {
  const file = req.file; // multer 添加的音频文件
  const word = req.body.word; // FormData 中的 word 字段

  console.log('Received word:', word);
  console.log('Received audio file:', file?.originalname, file?.size, 'bytes');

  if (!file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  if (!word) {
    return res.status(400).json({ error: 'No word provided' });
  }

  // TODO: 这里可以添加语音评分逻辑
  // file.buffer 包含音频数据

  return res.json({
    success: true,
    word,
    audioSize: file.size,
    message: 'Audio received successfully',
  });
}
