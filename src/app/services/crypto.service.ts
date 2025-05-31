// src/app/services/crypto.service.ts

import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  encrypt(message: string, password: string): string {
    return CryptoJS.AES.encrypt(message, password).toString();
  }

  decrypt(ciphertext: string, password: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
