import { HttpClient } from '@angular/common/http';
import { Component, inject, DOCUMENT, signal, ViewEncapsulation } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-learn',
  templateUrl: './learn.html',
  styleUrls: ['./learn.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Learn {
  private readonly dom = inject(DOCUMENT);
  private readonly http = inject(HttpClient);
  protected isRecording = signal(false);
  protected recorder?: MediaRecorder;
  protected async onRecordStart() {
    const win = await this.dom.defaultView;
    if (!win) {
      return;
    }
    const stream = await win.navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    this.isRecording.set(true);
    this.recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    this.recorder.ondataavailable = (e) => chunks.push(e.data);
    this.recorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('word', 'apple');

      const response = await lastValueFrom(
        this.http.post('/api/word/score', formData, { responseType: 'json' }),
      );
      console.log(response);
    };

    this.recorder.start();
  }

  protected onRecordStop() {
    this.recorder?.stop();
    this.recorder = undefined;
    this.isRecording.set(false);
  }
}
