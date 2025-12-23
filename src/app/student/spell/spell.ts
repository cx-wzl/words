import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Word, UnitNode, LessonNode } from '../../type/types';

interface LetterSlot {
  letter: string;
  filled: boolean;
}

@Component({
  selector: 'app-spell',
  imports: [
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    CdkDragPlaceholder,
    MatTreeModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './spell.html',
  styleUrls: ['./spell.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Spell implements OnInit {
  private readonly http = inject(HttpClient);
  private fullDict: Word[] = [];

  // Tree selection
  treeControl = new NestedTreeControl<UnitNode | LessonNode>((node) =>
    'lessons' in node ? node.lessons : null
  );
  dataSource = new MatTreeNestedDataSource<UnitNode>();
  lessonSelection = new SelectionModel<LessonNode>(true);

  words: string[] = [];
  currentIndex = 0;
  currentWord = '';
  scrambledLetters: string[] = [];
  letterSlots: LetterSlot[] = [];
  userAnswer: string[] = [];

  correctCount = 0;
  wrongCount = 0;
  gameStarted = false;
  gameFinished = false;
  showResult = false;
  isCorrect = false;

  ngOnInit(): void {
    this.initDictionary();
  }

  private initDictionary(): void {
    this.http.get<Word[]>('bookcase/power_up_level_0/dict.json').subscribe((dict: Word[]) => {
      this.fullDict = dict;
      this.buildTreeData();
    });
  }

  private buildTreeData(): void {
    const unitMap = new Map<number, Map<number, Word[]>>();

    for (const word of this.fullDict) {
      if (!unitMap.has(word.unit)) {
        unitMap.set(word.unit, new Map());
      }
      const lessonMap = unitMap.get(word.unit)!;
      if (!lessonMap.has(word.lesson)) {
        lessonMap.set(word.lesson, []);
      }
      lessonMap.get(word.lesson)!.push(word);
    }

    const units: UnitNode[] = [];
    const sortedUnits = Array.from(unitMap.keys()).sort((a, b) => a - b);

    for (const unitNum of sortedUnits) {
      const lessonMap = unitMap.get(unitNum)!;
      const lessons: LessonNode[] = [];
      const sortedLessons = Array.from(lessonMap.keys()).sort((a, b) => a - b);

      for (const lessonNum of sortedLessons) {
        const lessonWords = lessonMap.get(lessonNum)!;
        lessons.push({
          name: `Lesson ${lessonNum}`,
          unit: unitNum,
          lesson: lessonNum,
          words: lessonWords,
        });
      }

      units.push({
        name: `Unit ${unitNum}`,
        unit: unitNum,
        lessons,
      });
    }

    this.dataSource.data = units;

    // Select all lessons by default
    for (const unit of units) {
      for (const lesson of unit.lessons) {
        this.lessonSelection.select(lesson);
      }
    }
  }

  hasChild = (_: number, node: UnitNode | LessonNode): boolean => {
    return 'lessons' in node && node.lessons.length > 0;
  };

  isUnit(node: UnitNode | LessonNode): node is UnitNode {
    return 'lessons' in node;
  }

  isLesson(node: UnitNode | LessonNode): node is LessonNode {
    return 'words' in node;
  }

  getUnitWordCount(unit: UnitNode): number {
    return unit.lessons.reduce((sum, lesson) => sum + lesson.words.length, 0);
  }

  // Checkbox selection logic
  isUnitSelected(unit: UnitNode): boolean {
    return unit.lessons.every((lesson) => this.lessonSelection.isSelected(lesson));
  }

  isUnitIndeterminate(unit: UnitNode): boolean {
    const someSelected = unit.lessons.some((lesson) => this.lessonSelection.isSelected(lesson));
    const allSelected = this.isUnitSelected(unit);
    return someSelected && !allSelected;
  }

  toggleUnit(unit: UnitNode): void {
    if (this.isUnitSelected(unit)) {
      for (const lesson of unit.lessons) {
        this.lessonSelection.deselect(lesson);
      }
    } else {
      for (const lesson of unit.lessons) {
        this.lessonSelection.select(lesson);
      }
    }
  }

  toggleLesson(lesson: LessonNode): void {
    this.lessonSelection.toggle(lesson);
  }

  get selectedWordCount(): number {
    return this.lessonSelection.selected.reduce((sum, lesson) => sum + lesson.words.length, 0);
  }

  get canStartGame(): boolean {
    return this.selectedWordCount > 0;
  }

  startGame(): void {
    // Collect words from selected lessons
    const selectedWords: string[] = [];
    for (const lesson of this.lessonSelection.selected) {
      for (const word of lesson.words) {
        selectedWords.push(word.word);
      }
    }

    this.words = selectedWords.sort(() => Math.random() - 0.5);
    this.gameStarted = true;
    this.loadCurrentWord();
  }

  private loadCurrentWord(): void {
    if (this.currentIndex >= this.words.length) {
      this.gameFinished = true;
      return;
    }

    this.currentWord = this.words[this.currentIndex];
    this.userAnswer = new Array(this.currentWord.length).fill('');
    this.letterSlots = this.currentWord.split('').map(() => ({ letter: '', filled: false }));
    this.scrambledLetters = this.currentWord.split('').sort(() => Math.random() - 0.5);
    this.showResult = false;
  }

  dropToSlot(event: CdkDragDrop<string[]>, slotIndex: number): void {
    if (event.previousContainer === event.container) {
      return;
    }

    const letter = this.scrambledLetters[event.previousIndex];
    if (this.letterSlots[slotIndex].filled) {
      return;
    }

    this.letterSlots[slotIndex] = { letter, filled: true };
    this.userAnswer[slotIndex] = letter;
    this.scrambledLetters.splice(event.previousIndex, 1);
  }

  removeFromSlot(slotIndex: number): void {
    if (!this.letterSlots[slotIndex].filled) {
      return;
    }

    const letter = this.letterSlots[slotIndex].letter;
    this.scrambledLetters.push(letter);
    this.letterSlots[slotIndex] = { letter: '', filled: false };
    this.userAnswer[slotIndex] = '';
  }

  confirm(): void {
    const answer = this.userAnswer.join('');
    this.isCorrect = answer === this.currentWord;

    if (this.isCorrect) {
      this.correctCount++;
    } else {
      this.wrongCount++;
    }

    this.showResult = true;
  }

  nextWord(): void {
    this.currentIndex++;
    this.loadCurrentWord();
  }

  restart(): void {
    this.currentIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.gameStarted = false;
    this.gameFinished = false;
  }

  get progress(): string {
    return `${this.currentIndex + 1} / ${this.words.length}`;
  }

  get allSlotsFilled(): boolean {
    return this.letterSlots.every((slot) => slot.filled);
  }
}
