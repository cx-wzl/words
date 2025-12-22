export interface Word {
  word: string;
  lesson: number;
  unit: number;
}

export interface LessonNode {
  name: string;
  unit: number;
  lesson: number;
  words: Word[];
}

export interface UnitNode {
  name: string;
  unit: number;
  lessons: LessonNode[];
}
