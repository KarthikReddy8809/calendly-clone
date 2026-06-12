import { Toaster as SonnerToaster, toast } from 'sonner';
import { useUiStore } from '@/stores/ui-store';

/** App toaster bound to the current theme. */
export function Toaster() {
  const theme = useUiStore((s) => s.theme);
  return (
    <SonnerToaster
      theme={theme}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{ classNames: { toast: 'rounded-lg' } }}
    />
  );
}

export { toast };
