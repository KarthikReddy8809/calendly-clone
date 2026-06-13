import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
}

/** Generic confirmation dialog for destructive or irreversible actions. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive,
  isLoading,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className='flex flex-col gap-4'>
          <DialogTitle className='text-xl font-bold '>{title}</DialogTitle>
          {description && <DialogDescription >{description}</DialogDescription>}
        </DialogHeader>
        <div className='flex flex-row items-center justify-between gap-2 mt-8'>
          <Button variant="outline" onClick={() => onOpenChange(false)} size='lg' className='rounded-full px-16'>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            disabled={isLoading}
            onClick={onConfirm}
            size='lg'
            className='rounded-full px-16'
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
