import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { UppercaseDirective } from './uppercase.directive';

@Component({
  template: `
    <input type="text" appUppercase [formControl]="testControl" data-testid="test-input">
  `
})
class TestComponent {
  testControl = new FormControl('');
}

describe('UppercaseDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UppercaseDirective],
      declarations: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.nativeElement.querySelector('[data-testid="test-input"]');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert text to uppercase on input', () => {
    inputEl.value = 'batman';
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));

    expect(inputEl.value).toBe('BATMAN');
    expect(component.testControl.value).toBe('BATMAN');
  });

  it('should convert pasted text to uppercase', () => {
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', 'superman');
    
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: clipboardData,
      bubbles: true
    });
    
    inputEl.dispatchEvent(pasteEvent);
    
    expect(inputEl.value).toBe('SUPERMAN');
  });

  it('should convert text to uppercase on blur', () => {
    inputEl.value = 'wonder woman';
    inputEl.dispatchEvent(new Event('blur', { bubbles: true }));

    expect(inputEl.value).toBe('WONDER WOMAN');
  });

  it('should handle special characters and numbers', () => {
    inputEl.value = 'spider-man 2024!';
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));

    expect(inputEl.value).toBe('SPIDER-MAN 2024!');
  });
}); 