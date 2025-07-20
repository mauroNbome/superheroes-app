import { Directive, ElementRef, HostListener, inject } from '@angular/core';

/**
 * Directive to automatically convert input text to uppercase
 * Handles input, paste, and blur events to ensure consistent uppercase formatting
 */
@Directive({
  selector: '[appUppercase]',
  standalone: true
})
export class UppercaseDirective {

  private readonly el = inject(ElementRef<HTMLInputElement>);

  /**
   * Handles input events to convert text to uppercase as user types
   */
  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = event.target as HTMLInputElement;
    this.convertToUppercase(input);
  }

  /**
   * Handles paste events to convert pasted text to uppercase
   */
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    
    const input = this.el.nativeElement;
    const pastedText = event.clipboardData?.getData('text') || '';
    const upperText = pastedText.toUpperCase();
    
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = input.value;
    
    const newValue = currentValue.substring(0, start) + upperText + currentValue.substring(end);
    input.value = newValue;
    
    // Position cursor at end of pasted text
    const newPosition = start + upperText.length;
    input.setSelectionRange(newPosition, newPosition);
    
    // Trigger input event for reactive forms
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Handles blur events to ensure final conversion
   */
  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    this.convertToUppercase(input);
  }

  /**
   * Converts input value to uppercase and preserves cursor position
   */
  private convertToUppercase(input: HTMLInputElement): void {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const upperValue = input.value.toUpperCase();
    
    if (input.value !== upperValue) {
      input.value = upperValue;
      
      // Restore cursor position
      input.setSelectionRange(start, end);
      
      // Trigger input event for reactive forms detection
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
} 