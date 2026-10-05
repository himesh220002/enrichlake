import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';

export default function LegalShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="cf-light min-h-screen">
      <SiteNavbar variant="solid" />
      <main>
        <section className="bg-gradient-to-b from-[#eef3ff] via-[#f6f9ff] to-white">
          <div className="cf-container pb-10 pt-[104px] sm:pt-[120px]">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8a97b3]">
              <Link href="/" className="transition hover:text-[#1f5bff]">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-[#0b1b3f]">{title}</span>
            </nav>
            <p className="cf-eyebrow mt-6">{eyebrow}</p>
            <h1 className="mt-4 max-w-2xl text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] text-[#0b1b3f] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#55617c]">{intro}</p>
          </div>
        </section>
        <section className="bg-white">
          <div className="cf-container max-w-3xl py-12 sm:py-16">
            <div className="space-y-6 text-[15px] leading-7 text-[#43506b]">{children}</div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export function LegalH({ children }: { children: ReactNode }) {
  return <h2 className="pt-2 text-xl font-extrabold tracking-tight text-[#0b1b3f]">{children}</h2>;
}
