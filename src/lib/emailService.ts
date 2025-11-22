// src/lib/emailService.ts - ALWAYS uses production URL

import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export interface WelcomeEmailParams {
  user_name: string;
  user_email: string;
  confirmation_url: string;
}

export const sendWelcomeEmail = async (params: WelcomeEmailParams) => {
  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: params.user_email,
        to_name: params.user_name,
        user_name: params.user_name,
        confirmation_url: params.confirmation_url,
      },
      PUBLIC_KEY
    );

    console.log('Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error };
  }
};

// ALWAYS uses production URL - never localhost
export const generateConfirmationUrl = (token: string) => {
  const baseUrl = 'https://mspace-com.vercel.app';
  return `${baseUrl}/confirm-email?token=${token}`;
};