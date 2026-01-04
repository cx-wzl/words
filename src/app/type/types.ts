export interface LetterSlot {
  letter: string;
}

export interface Word {
  id: number;
  word: string;
  lesson: number;
  unit: number;
  kill?: boolean;
  result?: [{ date: string; correct: boolean }];
}
