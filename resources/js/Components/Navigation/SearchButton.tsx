import React from 'react';
import { Button } from '@/Components/ui/button';
import { SearchCommandDialog } from '@/Components/command-dialog';
import { Search } from 'lucide-react';

interface SearchButtonProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleCategoryClick: () => void;
}

export default function SearchButton({ open, setOpen, handleCategoryClick }: SearchButtonProps) {
  return (
    <div className="hidden sm:block ">
      {/* <SearchCommandDialog open={open} setOpen={setOpen} /> */}
      <Button
        variant={'ghost'}
        className="rounded-lg p-2 border h-10 "
        onClick={() => handleCategoryClick()}
      >
        <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        <small className="hidden lg:inline ml-1">(Ctrl+K)</small>
      </Button>
    </div>
  );
}
