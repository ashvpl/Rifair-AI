"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { motion, Variants } from 'framer-motion';
import { WebsiteIcon, PhoneIcon, AddressIcon } from "@/components/ui/info-icons";

// Prop types for the HeroSection component
interface HeroSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  logo?: {
    url: string;
    alt: string;
    text?: string;
  };
  slogan?: string;
  title: React.ReactNode;
  subtitle: string;
  callToAction: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  backgroundImage: string;
  contactInfo?: {
    website?: string;
    phone?: string;
    address?: string;
  };
}

const HeroSection2 = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (props, ref) => {
    const { 
      className, logo, slogan, title, subtitle, callToAction, backgroundImage, contactInfo, 
      ...restProps 
    } = props;
    
    const containerVariants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.2,
        },
      },
    };

    const itemVariants: Variants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut",
        },
      },
    };
    
    return (
      <motion.section
        ref={ref}
        className={cn(
          "relative flex w-full flex-col overflow-hidden bg-[#F5F5F7] text-[#1D1D1F] md:flex-row rounded-[2rem] md:rounded-[3rem] border border-black/5",
          className
        )}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        {...(restProps as any)}
      >
        {/* Left Side: Content */}
        <div className="flex w-full flex-col justify-center p-8 md:p-12 lg:w-3/5 lg:p-24">
            <div>
                {logo && (
                    <motion.header className="mb-12" variants={itemVariants}>
                        <div className="flex items-center">
                            <img src={logo.url} alt={logo.alt} className="mr-3 h-10 object-contain" />
                            <div>
                                {logo.text && <p className="text-xl font-black text-[#1D1D1F] uppercase tracking-tighter">{logo.text}</p>}
                                {slogan && <p className="text-[10px] font-bold tracking-[0.3em] text-black/40 uppercase">{slogan}</p>}
                            </div>
                        </div>
                    </motion.header>
                )}

                <motion.main variants={containerVariants}>
                    <motion.h2
                      className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-[#1D1D1F]"
                      variants={itemVariants}
                    >
                        {title}
                    </motion.h2>
                    <motion.div className="my-8 h-1.5 w-24 bg-primary" variants={itemVariants}></motion.div>
                    <motion.p
                        className="mb-10 max-w-lg text-lg text-black/60 font-medium leading-relaxed"
                        variants={itemVariants}
                      >
                        {subtitle}
                    </motion.p>
                    <motion.a 
                        href={callToAction.href} 
                        className="bg-black inline-flex items-center gap-3 text-white px-8 py-5 rounded-full text-base font-bold tracking-tight transition-all hover:scale-105 active:scale-95 shadow-xl"
                        variants={itemVariants}
                      >
                        {callToAction.text}
                        {callToAction.icon}
                    </motion.a>
                </motion.main>
            </div>

            {/* Bottom Section: Footer Info */}
            {contactInfo && (
                <motion.footer className="mt-16 w-full" variants={itemVariants}>
                    <div className="grid grid-cols-1 gap-8 text-sm font-bold text-black/40 sm:grid-cols-3 uppercase tracking-widest">
                        {contactInfo.website && (
                            <div className="flex items-center gap-2">
                                <WebsiteIcon className="h-4 w-4" />
                                <span>{contactInfo.website}</span>
                            </div>
                        )}
                        {contactInfo.phone && (
                            <div className="flex items-center gap-2">
                                <PhoneIcon className="h-4 w-4" />
                                <span>{contactInfo.phone}</span>
                            </div>
                        )}
                        {contactInfo.address && (
                            <div className="flex items-center gap-2">
                                <AddressIcon className="h-4 w-4" />
                                <span>{contactInfo.address}</span>
                            </div>
                        )}
                    </div>
                </motion.footer>
            )}
        </div>

        {/* Right Side: Image with Clip Path Animation */}
        <motion.div 
          className="w-full min-h-[400px] bg-cover bg-center md:w-1/2 md:min-h-full lg:w-2/5"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
          }}
          initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
          whileInView={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </motion.section>
    );
  }
);

HeroSection2.displayName = "HeroSection2";

export { HeroSection2 };
