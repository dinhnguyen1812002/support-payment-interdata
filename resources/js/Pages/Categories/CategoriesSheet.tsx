import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileSidebarProps {
    children: React.ReactNode;
    triggerWidth?: number;
    sidebarWidth?: number;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
                                                         children,
                                                         triggerWidth = 40,
                                                         sidebarWidth = 250
                                                     }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.x > 100) {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="relative md:hidden">
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: sidebarWidth }}
                onDragEnd={handleDragEnd}
                className="absolute left-0 top-0 h-full z-10"
                style={{ width: triggerWidth }}
            >
                <div className="w-full h-full bg-transparent" />
            </motion.div>

            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'tween' }}
                        className="fixed left-0 top-0 h-full bg-white shadow-lg z-20"
                        style={{ width: sidebarWidth }}
                    >
                        <div className="p-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileSidebar;
