import "./globals.css";
export const metadata = {
    title: "Vital Drop — Crash, Recover, Repeat | Real-Time Stock Market Dashboard",
    description: "Track stocks globally in real-time. Search any ticker from NSE, BSE, NASDAQ, NYSE and more. Interactive charts, watchlists, and top movers.",
    keywords: "stocks, trading, NSE, BSE, NASDAQ, real-time, portfolio, watchlist",
};
export default function RootLayout({ children }) {
    return (<html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
      </head>
      <body>{children}</body>
    </html>);
}
