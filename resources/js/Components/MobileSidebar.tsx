import React from 'react';
import Sidebar from '@/Components/Sidebar';

interface MobileSidebarProps {
    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: (open: boolean) => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
                                                         isMobileSidebarOpen,
                                                         setIsMobileSidebarOpen
                                                     }) => {
    if (!isMobileSidebarOpen) return null;

    return (
        <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
        >
            <div
                className="w-64 h-full bg-white dark:bg-gray-900 shadow-lg overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4">
                    <Sidebar categories={[]} />
                </div>
            </div>
        </div>
    );
};

export default MobileSidebar;
