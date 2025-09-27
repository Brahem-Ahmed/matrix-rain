// character-texture.service.ts
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class CharacterTextureService {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.context = this.canvas.getContext('2d')!;
  }

  generateTexture(): THREE.CanvasTexture {
    this.context.fillStyle = 'rgba(0, 0, 0, 0)';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const gridSize = 16;
    const cellWidth = this.canvas.width / gridSize;
    const cellHeight = this.canvas.height / gridSize;
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const char = this.characters[Math.floor(Math.random() * this.characters.length)];
        this.context.font = `${cellHeight * 0.8}px monospace`;
        this.context.fillStyle = `rgba(0, 255, 0, ${0.7 + Math.random() * 0.3})`;
        this.context.fillText(char, x * cellWidth, (y + 0.8) * cellHeight);
      }
    }
    
    return new THREE.CanvasTexture(this.canvas);
  }
}