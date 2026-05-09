
import "./legal.css";
import Link from "next/link";
import Image from "next/image";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="legal-body min-h-screen flex flex-col">
      <nav className="legal-nav">
        <Link href="/" className="flex items-center group">
          <div className="relative h-[32px] w-[130px] flex items-center">
            <Image 
              src="/rifair-logo.png" 
              alt="Rifair AI" 
              width={160}
              height={160}
              className="absolute left-0 h-[100px] w-auto object-contain scale-[1.5] origin-left"
              priority
            />
          </div>
        </Link>
        <Link href="/" className="back">
          ← Back to home
        </Link>
      </nav>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="legal-footer">
        <p>© 2026 Rifair AI. All rights reserved.</p>
        <p className="mt-4">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/refund">Refund Policy</Link>
        </p>
      </footer>
    </div>
  );
}
