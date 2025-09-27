// particle-system.service.ts
import { Injectable, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { CharacterTextureService } from './character-texture.service';

export interface Particle {
  position: THREE.Vector3;
  velocity: number;
  life: number;
  maxLife: number;
  charIndex: number;
  targetPosition: THREE.Vector3;
}

@Injectable({
  providedIn: 'root'
})
export class ParticleSystemService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles: Particle[] = [];
  private particleGroup!: THREE.Group;
  private characterTexture!: THREE.CanvasTexture;
  private clock: THREE.Clock;
  private particleCount = 2000;
  private particleGeometries: THREE.PlaneGeometry[] = [];
  private particleMaterials: THREE.MeshBasicMaterial[] = [];

  constructor(private textureService: CharacterTextureService) {
    this.clock = new THREE.Clock();
  }

  initialize(container: ElementRef): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.z = 5;
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.nativeElement.appendChild(this.renderer.domElement);
    
    this.characterTexture = this.textureService.generateTexture();
    this.createParticleSystem();
    this.animate();
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createParticleSystem(): void {
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);
    
    const gridSize = 16;
    const textureWidth = 1512;
    
    // Create geometries and materials for each character
    for (let i = 0; i < gridSize * gridSize; i++) {
      const geometry = new THREE.PlaneGeometry(0.3, 0.3);
      const material = new THREE.MeshBasicMaterial({
        map: this.characterTexture,
        transparent: true,
        opacity: 0.9,
        color: new THREE.Color(0x00ff00),
        alphaTest: 0.1
      });
      
      // Set UV mapping for specific character
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const u = col / gridSize;
      const v = 1 - (row + 1) / gridSize;
      const uWidth = 1 / gridSize;
      const vHeight = 1 / gridSize;
      
      geometry.attributes['uv'].array[0] = u; // bottom-left
      geometry.attributes['uv'].array[1] = v;
      geometry.attributes['uv'].array[2] = u + uWidth; // bottom-right
      geometry.attributes['uv'].array[3] = v;
      geometry.attributes['uv'].array[4] = u; // top-left
      geometry.attributes['uv'].array[5] = v + vHeight;
      geometry.attributes['uv'].array[6] = u + uWidth; // top-right
      geometry.attributes['uv'].array[7] = v + vHeight;
      
      geometry.attributes['uv'].needsUpdate = true;
      
      this.particleGeometries.push(geometry);
      this.particleMaterials.push(material);
    }
    
    // Initialize particles
    for (let i = 0; i < this.particleCount; i++) {
      this.createParticle(i);
    }
  }

  private createParticle(index: number): void {
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 10;
    const z = 0;
    
    const particle: Particle = {
      position: new THREE.Vector3(x, y, z),
      velocity: 0.02 + Math.random() * 0.03,
      life: Math.random() * 100,
      maxLife: 100 + Math.random() * 50,
      charIndex: Math.floor(Math.random() * this.particleGeometries.length),
      targetPosition: new THREE.Vector3(
        x,
        y - 10 - Math.random() * 5,
        z
      )
    };
    
    if (this.particles.length < this.particleCount) {
      this.particles.push(particle);
      
      const mesh = new THREE.Mesh(
        this.particleGeometries[particle.charIndex],
        this.particleMaterials[particle.charIndex]
      );
      mesh.position.copy(particle.position);
      this.particleGroup.add(mesh);
    } else {
      this.particles[index] = particle;
      const mesh = this.particleGroup.children[index] as THREE.Mesh;
      mesh.position.copy(particle.position);
    }
  }

  private updateParticles(): void {
    const delta = this.clock.getDelta();
    
    this.particles.forEach((particle, index) => {
      particle.life += delta * 30;
      
      // Move particle downward
      particle.position.y -= particle.velocity;
      
      // Reset particle when it goes below the screen or life expires
      if (particle.position.y < -6 || particle.life > particle.maxLife) {
        this.resetParticle(particle);
      }
      
      // Update opacity based on life
      const mesh = this.particleGroup.children[index] as THREE.Mesh;
      const material = mesh.material as THREE.MeshBasicMaterial;
      const lifeRatio = 1 - (particle.life / particle.maxLife);
      material.opacity = lifeRatio * 0.9;
      
      // Update position
      mesh.position.copy(particle.position);
    });
  }

  private resetParticle(particle: Particle): void {
    particle.position.x = (Math.random() - 0.5) * 10;
    particle.position.y = 6 + Math.random() * 2;
    particle.life = 0;
    particle.maxLife = 100 + Math.random() * 50;
    particle.velocity = 0.02 + Math.random() * 0.03;
    particle.charIndex = Math.floor(Math.random() * this.particleGeometries.length);
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.updateParticles();
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  destroy(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    window.removeEventListener('resize', () => this.onWindowResize());
  }
}