import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '@shared/material.module';
import { ThemeService } from '@services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() title: string = 'Súper Héroes App';
  
  private router = inject(Router);
  public themeService = inject(ThemeService);

  onHomeClick(): void {
    this.router.navigate(['/']);
  }

  onThemeToggle(): void {
    this.themeService.toggleTheme();
  }

  onSettingsClick(): void {
    console.log('Settings clicked');
    // TODO: Implementar funcionalidad de configuración
  }

  onProfileClick(): void {
    console.log('Profile clicked');
    // TODO: Implementar funcionalidad de perfil
  }
}
