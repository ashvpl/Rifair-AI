"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    textArray.length,
    textArrayIndex,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

import { useSignIn, useSignUp, useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function SignInForm() {
  const clerk = useClerk();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clerk.client) return;

    setLoading(true);
    setError("");

    try {
      const result = await clerk.client.signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await clerk.setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.log(result);
        setError("Something went wrong. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("error", err.errors[0].message);
      setError(err.errors[0].message || "An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your email below to sign in</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            autoComplete="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <PasswordInput 
          name="password" 
          label="Password" 
          required 
          autoComplete="current-password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-xs text-destructive text-center">{error}</p>}
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </form>
  );
}

export function SignUpForm() {
  const clerk = useClerk();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clerk.client) return;

    setLoading(true);
    setError("");

    try {
      await clerk.client.signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" "),
      });

      // Send verification email
      await clerk.client.signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      // Redirect to verification (standard Clerk route or handle locally)
      // For simplicity, we'll let Clerk handle the next steps if they go to /sign-up/verify
      // Or we could implement a verification UI here.
      // Given the request, we'll assume standard flow or just redirect.
      router.push("/sign-up/verify-email-address");
      
    } catch (err: any) {
      console.error("error", err.errors[0].message);
      setError(err.errors[0].message || "An error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your details below to sign up</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            name="name" 
            type="text" 
            placeholder="John Doe" 
            required 
            autoComplete="name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            autoComplete="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <PasswordInput 
          name="password" 
          label="Password" 
          required 
          autoComplete="new-password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-xs text-destructive text-center">{error}</p>}
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </div>
    </form>
  );
}


export function AuthFormContainer({ isSignIn, onToggle }: { isSignIn: boolean; onToggle: () => void; }) {
    const clerk = useClerk();
    const [socialLoading, setSocialLoading] = useState(false);
    
    // Check if clerk is actually ready
    const isReady = !!clerk.client;

    const handleSocialLogin = async (strategy: "oauth_google") => {
        if (!isReady) {
            console.error("Clerk client not ready");
            return;
        }

        setSocialLoading(true);
        console.log("Social login initiated", { strategy, isSignIn });
        
        try {
            if (isSignIn) {
                await clerk.client.signIn.authenticateWithRedirect({
                    strategy,
                    redirectUrl: "/sso-callback",
                    redirectUrlComplete: "/dashboard",
                });
            } else {
                await clerk.client.signUp.authenticateWithRedirect({
                    strategy,
                    redirectUrl: "/sso-callback",
                    redirectUrlComplete: "/dashboard",
                });
            }
        } catch (err) {
            console.error("Social login error", err);
            setSocialLoading(false);
        }
    };

    return (
        <div className="mx-auto grid w-[350px] gap-2">
            {isSignIn ? <SignInForm /> : <SignUpForm />}
            <div className="text-center text-sm">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button variant="link" className="pl-1 text-foreground" onClick={onToggle}>
                    {isSignIn ? "Sign up" : "Sign in"}
                </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
            <Button 
                variant="outline" 
                type="button" 
                onClick={() => handleSocialLogin("oauth_google")}
                disabled={socialLoading || !isReady}
            >
                {socialLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Connecting...
                    </div>
                ) : (
                    <>
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="mr-2 h-4 w-4" />
                        Continue with Google
                    </>
                )}
            </Button>
        </div>
    )
}


export interface AuthRotatingTextProps {
  messages: string[];
  duration?: number;
  className?: string;
}

export function AuthRotatingText({ 
  messages, 
  duration = 3500,
  className 
}: AuthRotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, duration);
    return () => clearInterval(timer);
  }, [messages.length, duration]);

  return (
    <div className={cn("relative h-[120px] w-full flex items-center justify-center overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center text-center text-xl md:text-2xl font-bold text-white tracking-tight leading-relaxed font-mono px-4"
        >
          “{messages[index]}”
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

const allAuthImages = [
    {
        src: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2000",
        alt: "Professional interview setting"
    },
    {
        src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2000",
        alt: "Modern executive office"
    },
    {
        src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000",
        alt: "Focused professional in discussion"
    },
    {
        src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2000",
        alt: "Modern workspace for new beginnings"
    },
    {
        src: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000",
        alt: "Collaborative team meeting"
    },
    {
        src: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2000",
        alt: "High-tech corporate environment"
    }
];

const allAuthMessages = [
    "Welcome back to the intelligence layer behind fair hiring.",
    "Continue building smarter and unbiased hiring systems.",
    "Your AI-powered hiring workspace is ready.",
    "Trusted hiring decisions start here.",
    "The future of ethical recruitment is already in your workflow.",
    "Start building the future of intelligent hiring.",
    "Transform hiring into a fair and data-driven process.",
    "Join the next generation of ethical recruitment.",
    "Build hiring systems candidates can actually trust.",
    "AI-powered fairness begins with your first decision."
];

interface AuthUIProps {
    children?: React.ReactNode;
    initialIsSignIn?: boolean;
}

export function AuthUI({ children, initialIsSignIn = true }: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(initialIsSignIn);
  const [imageIndex, setImageIndex] = useState(0);
  const toggleForm = () => setIsSignIn((prev) => !prev);

  useEffect(() => {
    const timer = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % allAuthImages.length);
    }, 6000); // Rotate image every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2 bg-background">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
        
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-move 15s ease infinite;
        }

        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
          pointer-events: none;
        }
      `}</style>

      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12 z-20 bg-background/50 backdrop-blur-sm">
        {children || <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} />}
      </div>

      <div className="hidden md:block relative overflow-hidden transition-all duration-700 ease-in-out">
        {/* Unified Rotating Cinematic Background Image */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={allAuthImages[imageIndex].src}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${allAuthImages[imageIndex].src})` }}
          />
        </AnimatePresence>

        {/* Premium Overlay Layers */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-black/20 via-transparent to-primary/10 z-10" />
        <div className="absolute inset-0 noise-overlay z-15" />
        
        {/* Glow Blobs */}
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full z-10 animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-white/10 blur-[120px] rounded-full z-10 animate-pulse" style={{ animationDelay: "2s" }} />

        {/* Content */}
        <div className="relative z-20 flex h-full flex-col items-center justify-end p-8 pb-20">
            <div className="w-full max-w-xl mx-auto space-y-6">
                <AuthRotatingText 
                  messages={allAuthMessages} 
                  className="mb-4"
                />
                
                <div className="flex flex-col items-center gap-4">
                  <div className="h-px w-12 bg-white/20" />
                  <cite className="block text-xs font-medium text-white/50 uppercase tracking-[0.3em] not-italic">
                      — Rifair AI
                  </cite>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
