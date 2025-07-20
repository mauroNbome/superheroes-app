import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';
import { LoadingComponent } from '@components/loading/loading.component';

/**
 * Root application component
 * Provides the main layout structure with header, content area, and footer
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  /** Application title displayed in header and footer */
  title = 'Súper Héroes App';
  
  /** Current year for footer copyright */
  currentYear = new Date().getFullYear();
}
