import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RenameScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onSave: (name: string) => void;
}

export function RenameScheduleDialog({
  open,
  onOpenChange,
  value,
  onSave,
}: RenameScheduleDialogProps) {
  const [name, setName] = useState(value);

  useEffect(() => {
    if (open) setName(value);
  }, [open, value]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>Rename schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Schedule name</label>
          <div className="relative">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="pr-9"
            />
            {name && (
              <button
                type="button"
                onClick={() => setName('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className='flex flex-row items-center justify-between gap-2 mt-8'>
          <Button variant="outline" onClick={() => onOpenChange(false)} size='lg'className='rounded-full px-16'>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()} size='lg' className='rounded-full px-16'>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
