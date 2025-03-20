import React, { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/Components/ui/toggle-group";
import { MoonStar, MonitorCog, Sun } from "lucide-react";
import { useTheme } from "@/Components/theme-provider";

export default function ThemeSwitch() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || theme === undefined) {
        return null;
    }

    return (
        <ToggleGroup
            className="rounded-full border p-1"
            size="sm"
            type="single"
            value={theme}

        >
            <ToggleGroupItem className="rounded-full" value="dark" aria-label="Toggle dark" onClick={() => setTheme("dark")}>
                <MoonStar size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem className="rounded-full" value="system" aria-label="Toggle system" onClick={() => setTheme("system")}>
                <MonitorCog size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem className="rounded-full" value="light" aria-label="Toggle light" onClick={() => setTheme("light")}>
                <Sun size={16} />
            </ToggleGroupItem>
        </ToggleGroup>
    );
}
