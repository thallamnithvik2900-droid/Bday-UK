import "./globals.css";

export const metadata = {
  title: "A Surprise For You ❤️",
  description: "A little birthday experience made with love.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}