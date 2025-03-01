import React, { createContext, useContext } from "react";
import { Category, Notification } from "@/types";

interface AppContextProps {
    categories: Category[];
    notifications: Notification[];
    keyword?: string;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ value: AppContextProps; children: React.ReactNode }> = ({ value, children }) => {
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
