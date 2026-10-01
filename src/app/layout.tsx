import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Commercial Director",
    template: "%s | Commercial Director",
  },
  description: "제품 이미지 한 장에서 Campaign Bible, 20개 Concept, Asset Bible, Production Plan까지 만드는 광고 크리에이티브 디렉터 OS.",
  openGraph: {
    title: "Commercial Director",
    description: "제품 이미지 한 장에서 광고 캠페인과 제작 문서까지 설계합니다.",
    type: "website",
    locale: "ko_KR",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Commercial Director",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commercial Director",
    description: "제품 이미지 한 장에서 광고 캠페인과 제작 문서까지 설계합니다.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
