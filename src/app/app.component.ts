import { Component } from '@angular/core';
import { MatrixRainComponent } from './matrix-rain-component/matrix-rain-component.component';

@Component({
  selector: 'app-root',
  imports: [MatrixRainComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'matrix-rain';
}
