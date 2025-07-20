import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent, BrowserAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default title', () => {
    expect(component.title).toBe('Súper Héroes App');
  });

  it('should have current year', () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('should render footer element', () => {
    const footer = fixture.debugElement.query(By.css('.app-footer'));
    expect(footer).toBeTruthy();
  });

  it('should render footer toolbar', () => {
    const toolbar = fixture.debugElement.query(By.css('.footer-toolbar'));
    expect(toolbar).toBeTruthy();
  });

  it('should render footer content container', () => {
    const footerContent = fixture.debugElement.query(By.css('.footer-content'));
    expect(footerContent).toBeTruthy();
  });

  it('should render footer left section', () => {
    const footerLeft = fixture.debugElement.query(By.css('.footer-left'));
    expect(footerLeft).toBeTruthy();
  });

  it('should render footer right section', () => {
    const footerRight = fixture.debugElement.query(By.css('.footer-right'));
    expect(footerRight).toBeTruthy();
  });

  it('should display copyright text with title and year', () => {
    const footerText = fixture.debugElement.query(By.css('.footer-text'));
    expect(footerText).toBeTruthy();
    
    const textContent = footerText.nativeElement.textContent;
    expect(textContent).toContain('©');
    expect(textContent).toContain(component.currentYear.toString());
    expect(textContent).toContain(component.title);
    expect(textContent).toContain('Angular');
  });

  it('should display custom title when provided', () => {
    const customTitle = 'Custom Heroes App';
    component.title = customTitle;
    fixture.detectChanges();

    const footerText = fixture.debugElement.query(By.css('.footer-text'));
    expect(footerText.nativeElement.textContent).toContain(customTitle);
  });

  it('should display custom year when provided', () => {
    const customYear = 2025;
    component.currentYear = customYear;
    fixture.detectChanges();

    const footerText = fixture.debugElement.query(By.css('.footer-text'));
    expect(footerText.nativeElement.textContent).toContain(customYear.toString());
  });

  it('should render heart icon', () => {
    const heartIcon = fixture.debugElement.query(By.css('.heart-icon'));
    expect(heartIcon).toBeTruthy();
    expect(heartIcon.nativeElement.textContent).toBe('favorite');
  });

  it('should render about button', () => {
    const aboutBtn = fixture.debugElement.query(By.css('[data-testid="about-btn"]'));
    expect(aboutBtn).toBeTruthy();
    
    const icon = aboutBtn.query(By.css('mat-icon'));
    expect(icon.nativeElement.textContent).toBe('info');
    expect(aboutBtn.nativeElement.textContent).toContain('Acerca de');
  });

  it('should render help button', () => {
    const helpBtn = fixture.debugElement.query(By.css('[data-testid="help-btn"]'));
    expect(helpBtn).toBeTruthy();
    
    const icon = helpBtn.query(By.css('mat-icon'));
    expect(icon.nativeElement.textContent).toBe('help');
    expect(helpBtn.nativeElement.textContent).toContain('Ayuda');
  });

  it('should render github button', () => {
    const githubBtn = fixture.debugElement.query(By.css('[data-testid="github-btn"]'));
    expect(githubBtn).toBeTruthy();
    
    const icon = githubBtn.query(By.css('mat-icon'));
    expect(icon.nativeElement.textContent).toBe('code');
    expect(githubBtn.nativeElement.textContent).toContain('GitHub');
  });

  it('should call onAboutClick when about button is clicked', () => {
    spyOn(component, 'onAboutClick');
    
    const aboutBtn = fixture.debugElement.query(By.css('[data-testid="about-btn"]'));
    aboutBtn.nativeElement.click();
    
    expect(component.onAboutClick).toHaveBeenCalled();
  });

  it('should call onHelpClick when help button is clicked', () => {
    spyOn(component, 'onHelpClick');
    
    const helpBtn = fixture.debugElement.query(By.css('[data-testid="help-btn"]'));
    helpBtn.nativeElement.click();
    
    expect(component.onHelpClick).toHaveBeenCalled();
  });

  it('should call onGithubClick when github button is clicked', () => {
    spyOn(component, 'onGithubClick');
    
    const githubBtn = fixture.debugElement.query(By.css('[data-testid="github-btn"]'));
    githubBtn.nativeElement.click();
    
    expect(component.onGithubClick).toHaveBeenCalled();
  });

  it('should log to console when about button is clicked', () => {
    spyOn(console, 'log');
    
    component.onAboutClick();
    
    expect(console.log).toHaveBeenCalledWith('About clicked');
  });

  it('should log to console when help button is clicked', () => {
    spyOn(console, 'log');
    
    component.onHelpClick();
    
    expect(console.log).toHaveBeenCalledWith('Help clicked');
  });

  it('should log to console and open window when github button is clicked', () => {
    spyOn(console, 'log');
    spyOn(window, 'open');
    
    component.onGithubClick();
    
    expect(console.log).toHaveBeenCalledWith('GitHub clicked');
    expect(window.open).toHaveBeenCalledWith('https://github.com', '_blank');
  });

  it('should have three footer link buttons', () => {
    const footerLinks = fixture.debugElement.queryAll(By.css('.footer-link'));
    expect(footerLinks.length).toBe(3);
  });

  it('should have proper CSS classes', () => {
    const footer = fixture.debugElement.query(By.css('.app-footer'));
    const toolbar = fixture.debugElement.query(By.css('.footer-toolbar'));
    const footerContent = fixture.debugElement.query(By.css('.footer-content'));
    const footerLeft = fixture.debugElement.query(By.css('.footer-left'));
    const footerRight = fixture.debugElement.query(By.css('.footer-right'));
    
    expect(footer.nativeElement).toHaveClass('app-footer');
    expect(toolbar.nativeElement).toHaveClass('footer-toolbar');
    expect(footerContent.nativeElement).toHaveClass('footer-content');
    expect(footerLeft.nativeElement).toHaveClass('footer-left');
    expect(footerRight.nativeElement).toHaveClass('footer-right');
  });

  it('should accept title as input property', () => {
    const testTitle = 'Test Title';
    component.title = testTitle;
    fixture.detectChanges();
    
    expect(component.title).toBe(testTitle);
    
    const footerText = fixture.debugElement.query(By.css('.footer-text'));
    expect(footerText.nativeElement.textContent).toContain(testTitle);
  });

  it('should accept currentYear as input property', () => {
    const testYear = 2030;
    component.currentYear = testYear;
    fixture.detectChanges();
    
    expect(component.currentYear).toBe(testYear);
    
    const footerText = fixture.debugElement.query(By.css('.footer-text'));
    expect(footerText.nativeElement.textContent).toContain(testYear.toString());
  });

  it('should have heart icon with proper animation class', () => {
    const heartIcon = fixture.debugElement.query(By.css('.heart-icon'));
    expect(heartIcon.nativeElement).toHaveClass('heart-icon');
  });

  it('should render footer text with proper structure', () => {
    const footerText = fixture.debugElement.query(By.css('.footer-text'));
    const heartIcon = footerText.query(By.css('.heart-icon'));
    
    expect(footerText).toBeTruthy();
    expect(heartIcon).toBeTruthy();
    
    const textContent = footerText.nativeElement.textContent;
    expect(textContent).toMatch(/©\s*\d{4}.*Desarrollado con.*y Angular/);
  });
}); 