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

export interface BookInfo {
  title: string;
  subTitle: string;
  image: string;
}

export interface BookInfoWithPath extends BookInfo {
  folder: string; // bookcase 文件夹名，如 "power_up_level_0"
}
