import type { Metadata } from "next";
import { Calistoga, Inter } from "next/font/google";
import "./globals.css";

const calistoga = Calistoga({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SOLA — Sparkling Botanicals",
  description:
    "Sparkling botanical sodas, brewed with real fruit and herbs. No syrup, no noise — just something to slow down with.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${calistoga.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* refresh should start at the top rather than restoring into the
            middle of the pinned pour section */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if('scrollRestoration' in history){history.scrollRestoration='manual';}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
