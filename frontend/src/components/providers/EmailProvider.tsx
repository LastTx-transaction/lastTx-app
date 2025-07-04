'use client';

import { useEffect } from 'react';
import { emailService } from '@/lib/services/email.service';

interface EmailProviderProps {
  children: React.ReactNode;
}

export default function EmailProvider({ children }: EmailProviderProps) {
  useEffect(() => {
    // Initialize EmailJS when component mounts
    emailService.init();

    // Log configuration status for debugging
    const configStatus = emailService.getConfigStatus();
    console.log('📧 EmailJS Configuration Status:', configStatus);

    if (emailService.isConfigured()) {
      console.log('✅ EmailJS is properly configured');
    } else {
      console.warn(
        '⚠️ EmailJS is not fully configured. Please check environment variables.',
      );
    }
  }, []);

  return <>{children}</>;
}
