import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function formatTimeAgo  (date: string) {
    try {
        if (!date) return 'Invalid date';

        const now = new Date();
        const notificationDate = new Date(date);

        if (isNaN(notificationDate.getTime())) return 'Invalid date';

        const diffInHours = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return format(notificationDate, "HH:mm", { locale: vi });
        } else if (diffInHours < 48) {
            return "Hôm qua";
        } else {
            return format(notificationDate, "dd/MM/yyyy", { locale: vi });
        }
    } catch (error) {
        return 'Invalid date';
    }
};
