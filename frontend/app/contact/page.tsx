import React from "react";
import { Metadata } from "next";
import { NavBarDemo } from "@/components/ui/navbar-demo";
import FooterSection from "@/components/ui/footer-section";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, ShieldCheck, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Rifair AI",
  description: "Get in touch with the Rifair AI team for support, feature inquiries, or feedback on our ethical hiring assistant.",
  alternates: {
    canonical: "https://rifairai.com/contact",
  },
  openGraph: {
    title: "Contact Us | Rifair AI",
    description: "Get in touch with the Rifair AI team for support, feature inquiries, or feedback on our ethical hiring assistant.",
    url: "https://rifairai.com/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-500">
      <NavBarDemo />

      <main className="flex-grow pt-24 md:pt-32">
        <section className="px-6 lg:px-12 py-16 text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1D1D1F] tracking-tight leading-tight">
            Get in Touch
          </h1>
          <p className="text-[#86868B] text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Have questions about our enterprise plans, custom AI models, features, or need support? We're here to help.
          </p>
        </section>

        <section className="px-6 lg:px-12 pb-24 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Contact channels */}
            <div className="bg-white border-2 border-black p-8 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-[#1D1D1F]">Support & Enquiries</h3>
                <p className="text-[#86868B] font-medium text-sm leading-relaxed">
                  Our customer success team responds to inquiries, bug reports, and plan upgrades within 24 hours.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">General Support</h4>
                      <a href="mailto:support@rifairai.com" className="text-sm font-semibold text-black hover:underline">
                        support@rifairai.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Security & Privacy</h4>
                      <a href="mailto:support@rifairai.com" className="text-sm font-semibold text-black hover:underline">
                        support@rifairai.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-black/5 mt-8 flex items-center gap-2 text-xs font-bold text-black/50 uppercase tracking-widest">
                <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                Response Guaranteed
              </div>
            </div>

            {/* Support Desk info */}
            <div className="bg-[#101012] text-white p-8 rounded-3xl border border-white/10 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black">Interactive Help Desk</h3>
                <p className="text-white/60 font-medium text-sm leading-relaxed">
                  Already logged in? You can raise support tickets directly inside your settings panel. Our built-in help desk connects directly with technical teams to fix account problems instantly.
                </p>
              </div>

              <div className="pt-8">
                <a href="/help" className="inline-block w-full">
                  <Button className="w-full bg-white text-black hover:bg-white/90 font-bold py-6 rounded-full text-base transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    Visit Help Desk
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
