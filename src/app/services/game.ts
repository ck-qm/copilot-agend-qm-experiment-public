import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GameState {
  isRunning: boolean;
  score: number;
  isGameOver: boolean;
  playerX: number;
  playerY: number;
  velocityY: number;
  platforms: Platform[];
  coins: Coin[];
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Game {
  private gameStateSubject = new BehaviorSubject<GameState>(this.getInitialState());
  public gameState$: Observable<GameState> = this.gameStateSubject.asObservable();

  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 600;
  private readonly PLAYER_SIZE = 30;
  private readonly GRAVITY = 0.5;
  private readonly JUMP_STRENGTH = -12;
  private readonly MOVE_SPEED = 5;

  private animationFrameId: number | null = null;
  private keys: { [key: string]: boolean } = {};

  constructor() {
    this.setupKeyListeners();
  }

  private getInitialState(): GameState {
    return {
      isRunning: false,
      score: 0,
      isGameOver: false,
      playerX: 100,
      playerY: 450,
      velocityY: 0,
      platforms: this.generatePlatforms(),
      coins: this.generateCoins(),
    };
  }

  private generatePlatforms(): Platform[] {
    return [
      { x: 0, y: 550, width: 800, height: 50 }, // Ground
      { x: 200, y: 450, width: 150, height: 20 },
      { x: 450, y: 350, width: 150, height: 20 },
      { x: 150, y: 250, width: 150, height: 20 },
      { x: 500, y: 200, width: 150, height: 20 },
      { x: 300, y: 150, width: 150, height: 20 },
    ];
  }

  private generateCoins(): Coin[] {
    return [
      { x: 260, y: 400, collected: false },
      { x: 510, y: 300, collected: false },
      { x: 210, y: 200, collected: false },
      { x: 560, y: 150, collected: false },
      { x: 360, y: 100, collected: false },
      { x: 400, y: 500, collected: false },
      { x: 650, y: 450, collected: false },
    ];
  }

  private setupKeyListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  startGame(): void {
    const state = this.getInitialState();
    state.isRunning = true;
    this.gameStateSubject.next(state);
    this.gameLoop();
  }

  pauseGame(): void {
    const state = this.gameStateSubject.value;
    state.isRunning = false;
    this.gameStateSubject.next(state);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop = (): void => {
    const state = this.gameStateSubject.value;
    if (!state.isRunning || state.isGameOver) {
      return;
    }

    this.updatePlayer(state);
    this.checkCollisions(state);
    this.gameStateSubject.next({ ...state });

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private updatePlayer(state: GameState): void {
    // Horizontal movement
    if (this.keys['ArrowLeft'] || this.keys['a']) {
      state.playerX = Math.max(0, state.playerX - this.MOVE_SPEED);
    }
    if (this.keys['ArrowRight'] || this.keys['d']) {
      state.playerX = Math.min(
        this.CANVAS_WIDTH - this.PLAYER_SIZE,
        state.playerX + this.MOVE_SPEED
      );
    }

    // Jumping
    if ((this.keys[' '] || this.keys['ArrowUp'] || this.keys['w']) && state.velocityY === 0) {
      state.velocityY = this.JUMP_STRENGTH;
    }

    // Apply gravity
    state.velocityY += this.GRAVITY;
    state.playerY += state.velocityY;

    // Check if player fell off the screen
    if (state.playerY > this.CANVAS_HEIGHT) {
      state.isGameOver = true;
      state.isRunning = false;
    }
  }

  private checkCollisions(state: GameState): void {
    let onPlatform = false;

    // Check platform collisions
    for (const platform of state.platforms) {
      if (
        state.playerX + this.PLAYER_SIZE > platform.x &&
        state.playerX < platform.x + platform.width &&
        state.playerY + this.PLAYER_SIZE >= platform.y &&
        state.playerY + this.PLAYER_SIZE <= platform.y + platform.height &&
        state.velocityY >= 0
      ) {
        state.playerY = platform.y - this.PLAYER_SIZE;
        state.velocityY = 0;
        onPlatform = true;
        break;
      }
    }

    // Check coin collisions
    for (const coin of state.coins) {
      if (
        !coin.collected &&
        state.playerX + this.PLAYER_SIZE > coin.x &&
        state.playerX < coin.x + 20 &&
        state.playerY + this.PLAYER_SIZE > coin.y &&
        state.playerY < coin.y + 20
      ) {
        coin.collected = true;
        state.score += 100;
      }
    }
  }

  getCurrentState(): GameState {
    return this.gameStateSubject.value;
  }
}
