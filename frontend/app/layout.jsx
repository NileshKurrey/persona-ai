import './globals.css';

export const metadata = {
  title: 'Persona AI - talk to Hitesh or Piyush',
  description:
    'An AI persona chat that responds like Hitesh Choudhary or Piyush Garg, built for the Chaicode GenAI JS cohort.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
