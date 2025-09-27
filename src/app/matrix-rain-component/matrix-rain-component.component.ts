// matrix-rain.component.ts
import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { ParticleSystemService } from './Services/particle-system.service';

@Component({
  selector: 'app-matrix-rain',
  templateUrl: './matrix-rain-component.component.html',
  styleUrls: ['./matrix-rain-component.component.scss']
})
export class MatrixRainComponent implements AfterViewInit, OnDestroy {
  @ViewChild('matrixContainer', { static: true }) 
  matrixContainer!: ElementRef;

  constructor(private particleSystem: ParticleSystemService) {}

  ngAfterViewInit(): void {
    this.particleSystem.initialize(this.matrixContainer);
  }

  ngOnDestroy(): void {
    this.particleSystem.destroy();
  }
}