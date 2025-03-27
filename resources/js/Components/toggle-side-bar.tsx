import React from 'react';
import { Button } from '@/Components/ui/button';
import { Menu, X } from 'lucide-react';

interface MobileSidebarToggleProps {
    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: (open: boolean) => void;
}

const MobileSidebarToggle: React.FC<MobileSidebarToggleProps> = ({
                                                                     isMobileSidebarOpen,
                                                                     setIsMobileSidebarOpen
                                                                 }) => {
    return (
        <div className="lg:hidden  top-4 z-50">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="text-gray-600 mr-1"
            >
                {isMobileSidebarOpen ? <X size={24} /> : <Menu size={5} />}
            </Button>
        </div>
    );
};

export default MobileSidebarToggle;
