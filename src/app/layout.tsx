import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PepTalk · Clinical Peptide Intelligence & Masterclass Archive',
  description: 'Evidence-based peptide research, clinical monographs, dosing protocols, and masterclass curriculum.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
