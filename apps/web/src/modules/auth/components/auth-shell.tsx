import * as motion from 'motion/react-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/common/theme-toggle';

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/** Two-column layout shared by the login and signup pages. */
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen bg-background">
      <ThemeToggle className="absolute right-4 top-4 z-10" />
      <div className="flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            scale: { type: 'spring', visualDuration: 0.4, bounce: 0.4 },
          }}
          className="flex w-full max-w-md flex-col items-center gap-6"
        >
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
              <circle cx="16" cy="16" r="15" fill="#006BFF" />
              <circle cx="16" cy="16" r="8.5" fill="none" stroke="white" strokeWidth="3" />
            </svg>
            <span className="text-2xl tracking-tight text-primary">Calendly</span>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">{footer}</p>
        </motion.div>
      </div>

      <div className="hidden w-1/2 items-center justify-center bg-muted/50 p-10 lg:flex">
        <img src="/login.svg" alt="" className="max-w-xl" />
      </div>
    </div>
  );
}
