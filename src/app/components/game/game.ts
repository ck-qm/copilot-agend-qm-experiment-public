import { Component, ElementRef, OnInit, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Game as GameService, GameState } from '../../services/game';
import { Highscore } from '../../services/highscore';

@Component({
  selector: 'app-game',
  imports: [CommonModule],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  protected gameStarted = signal(false);
  protected gameOver = signal(false);
  protected currentScore = signal(0);
  protected highscore = signal(0);
  protected shareUrl = signal('');

  private ctx!: CanvasRenderingContext2D;
  private subscription?: Subscription;

  // QualityMinds brand colors
  private readonly PRIMARY_COLOR = '#0066CC'; // Blue
  private readonly SECONDARY_COLOR = '#FFFFFF'; // White
  private readonly ACCENT_COLOR = '#FFD700'; // Gold for coins
  private readonly PLATFORM_COLOR = '#4A90E2'; // Light blue

  constructor(
    private gameService: GameService,
    private highscoreService: Highscore
  ) {}

  async ngOnInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.subscription = this.gameService.gameState$.subscribe((state) => {
      this.renderGame(state);
      this.currentScore.set(state.score);

      if (state.isGameOver && !this.gameOver()) {
        this.handleGameOver(state.score);
      }
    });

    // Load initial highscore
    this.highscore.set(await this.highscoreService.getHighscore());
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  startGame() {
    this.gameStarted.set(true);
    this.gameOver.set(false);
    this.currentScore.set(0);
    this.shareUrl.set('');
    this.gameService.startGame();
  }

  private async handleGameOver(score: number) {
    this.gameOver.set(true);
    this.gameStarted.set(false);

    // Save score to IndexedDB
    await this.highscoreService.saveScore(score);

    // Update highscore if needed
    const currentHighscore = await this.highscoreService.getHighscore();
    this.highscore.set(currentHighscore);

    // Generate shareable URL
    const baseUrl = window.location.origin + window.location.pathname;
    this.shareUrl.set(`${baseUrl}?score=${score}`);
  }

  private renderGame(state: GameState) {
    if (!this.ctx) return;

    // Clear canvas with QualityMinds background
    this.ctx.fillStyle = '#F0F4F8'; // Light background
    this.ctx.fillRect(0, 0, 800, 600);

    // Draw platforms
    this.ctx.fillStyle = this.PLATFORM_COLOR;
    for (const platform of state.platforms) {
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      // Add border
      this.ctx.strokeStyle = this.PRIMARY_COLOR;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Draw coins
    for (const coin of state.coins) {
      if (!coin.collected) {
        this.ctx.fillStyle = this.ACCENT_COLOR;
        this.ctx.beginPath();
        this.ctx.arc(coin.x + 10, coin.y + 10, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    }

    // Draw player (QualityMinds branded character)
    this.ctx.fillStyle = this.PRIMARY_COLOR;
    this.ctx.fillRect(state.playerX, state.playerY, 30, 30);
    this.ctx.strokeStyle = this.SECONDARY_COLOR;
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(state.playerX, state.playerY, 30, 30);

    // Draw score
    this.ctx.fillStyle = this.PRIMARY_COLOR;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText(`Score: ${state.score}`, 20, 40);
  }

  copyShareUrl() {
    navigator.clipboard.writeText(this.shareUrl());
  }
}
