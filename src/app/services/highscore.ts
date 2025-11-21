import { Injectable } from '@angular/core';

export interface HighscoreEntry {
  id?: number;
  score: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class Highscore {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'JumpAndRunDB';
  private readonly STORE_NAME = 'highscores';
  private readonly DB_VERSION = 1;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const objectStore = db.createObjectStore(this.STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          objectStore.createIndex('score', 'score', { unique: false });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveScore(score: number): Promise<number> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const entry: HighscoreEntry = {
        score,
        timestamp: Date.now(),
      };

      const request = store.add(entry);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getHighscore(): Promise<number> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('score');
      const request = index.openCursor(null, 'prev');

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          resolve((cursor.value as HighscoreEntry).score);
        } else {
          resolve(0);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllScores(): Promise<HighscoreEntry[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('score');
      const request = index.openCursor(null, 'prev');
      const scores: HighscoreEntry[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          scores.push(cursor.value as HighscoreEntry);
          cursor.continue();
        } else {
          resolve(scores.slice(0, 10)); // Return top 10 scores
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}
