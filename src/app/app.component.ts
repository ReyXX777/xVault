import { Component } from '@angular/core';
import { CryptoService } from './services/crypto.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  password: string = '';
  inputMessage: string = '';
  outputMessage: string = '';
  
  // Key strength properties
  keyStrength: number = 0;
  keyStrengthText: string = 'No Key';
  keyStrengthClass: string = 'weak';

  constructor(private cryptoService: CryptoService) {}

  // Calculate key strength whenever password changes
  onPasswordChange() {
    this.calculateKeyStrength();
  }

  private calculateKeyStrength() {
    if (!this.password) {
      this.keyStrength = 0;
      this.keyStrengthText = 'No Key';
      this.keyStrengthClass = 'none';
      return;
    }

    let strength = 0;
    const password = this.password;

    // Length scoring (0-40 points)
    if (password.length >= 8) strength += 15;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;
    if (password.length >= 20) strength += 5;

    // Character variety scoring (0-40 points)
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (hasLowerCase) strength += 5;
    if (hasUpperCase) strength += 5;
    if (hasNumbers) strength += 10;
    if (hasSpecialChars) strength += 15;

    // Bonus for having all character types
    if (hasLowerCase && hasUpperCase && hasNumbers && hasSpecialChars) {
      strength += 5;
    }

    // Complexity patterns (0-20 points)
    const uniqueChars = new Set(password).size;
    const uniqueRatio = uniqueChars / password.length;
    
    if (uniqueRatio > 0.7) strength += 10;
    else if (uniqueRatio > 0.5) strength += 5;

    // Check for common patterns (deduct points)
    const commonPatterns = [
      /123456/,
      /abcdef/,
      /password/i,
      /qwerty/i,
      /111111/,
      /000000/,
      /(.)\1{2,}/g // repeated characters
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        strength -= 15;
      }
    }

    // Sequential characters penalty
    let sequentialCount = 0;
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);
      
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        sequentialCount++;
      }
    }
    strength -= sequentialCount * 5;

    // Ensure strength is between 0-100
    this.keyStrength = Math.max(0, Math.min(100, strength));

    // Set strength text and class
    this.updateStrengthDisplay();
  }

  private updateStrengthDisplay() {
    if (this.keyStrength === 0) {
      this.keyStrengthText = 'No Key';
      this.keyStrengthClass = 'none';
    } else if (this.keyStrength < 30) {
      this.keyStrengthText = 'Very Weak';
      this.keyStrengthClass = 'very-weak';
    } else if (this.keyStrength < 50) {
      this.keyStrengthText = 'Weak';
      this.keyStrengthClass = 'weak';
    } else if (this.keyStrength < 70) {
      this.keyStrengthText = 'Moderate';
      this.keyStrengthClass = 'moderate';
    } else if (this.keyStrength < 85) {
      this.keyStrengthText = 'Strong';
      this.keyStrengthClass = 'strong';
    } else {
      this.keyStrengthText = 'Very Strong';
      this.keyStrengthClass = 'very-strong';
    }
  }

  // Enhanced validation for encryption
  onEncrypt() {
    if (!this.password) {
      alert('Please enter an encryption key!');
      return;
    }
    
    if (this.keyStrength < 30) {
      const proceed = confirm(
        `Warning: Your encryption key is ${this.keyStrengthText.toLowerCase()}. ` +
        'This may compromise security. Do you want to continue?'
      );
      if (!proceed) return;
    }

    if (!this.inputMessage.trim()) {
      alert('Please enter a message to encrypt!');
      return;
    }

    try {
      this.outputMessage = this.cryptoService.encrypt(this.inputMessage, this.password);
    } catch (e) {
      alert('Encryption failed. Please try again.');
    }
  }

  onDecrypt() {
    if (!this.password) {
      alert('Please enter an encryption key!');
      return;
    }

    if (!this.inputMessage.trim()) {
      alert('Please enter an encrypted message to decrypt!');
      return;
    }

    try {
      this.outputMessage = this.cryptoService.decrypt(this.inputMessage, this.password);
    } catch (e) {
      alert('Decryption failed. Please check your input and encryption key.');
    }
  }

  // Utility methods for template
  copyToClipboard() {
    if (this.outputMessage) {
      navigator.clipboard.writeText(this.outputMessage).then(() => {
        // You could add a toast notification here
        console.log('Content copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  }

  clearOutput() {
    this.outputMessage = '';
  }

  clearAll() {
    this.password = '';
    this.inputMessage = '';
    this.outputMessage = '';
    this.calculateKeyStrength();
  }
}