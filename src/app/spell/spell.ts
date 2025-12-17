import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';

interface LetterSlot {
  letter: string;
  filled: boolean;
}

@Component({
  selector: 'app-spell',
  imports: [CommonModule, CdkDrag, CdkDropList, CdkDropListGroup, CdkDragPlaceholder],
  templateUrl: './spell.html',
  styleUrls: ['./spell.scss'],
})
export class Spell implements OnInit {
  private readonly http = inject(HttpClient);
  private dict: string[] = [];

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
    this.http.get<string[]>('bookcase/power_up_level_0/dict.json').subscribe((dict: string[]) => {
      this.dict = dict;
      this.shuffleWords();
    });
  }

  startGame(): void {
    this.gameStarted = true;
    this.loadCurrentWord();
  }

  private shuffleWords(): void {
    this.words = [...this.dict].sort(() => Math.random() - 0.5);
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
    this.shuffleWords();
  }

  get progress(): string {
    return `${this.currentIndex + 1} / ${this.words.length}`;
  }

  get allSlotsFilled(): boolean {
    return this.letterSlots.every((slot) => slot.filled);
  }
}
