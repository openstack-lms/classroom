import { HiBell, HiCheck, HiExclamation, HiInformationCircle } from "react-icons/hi";
import Button from "@/components/ui/Button";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return <HiCheck className="size-5 text-success" />;
    case "warning":
      return <HiExclamation className="size-5 text-warning" />;
    case "error":
      return <HiExclamation className="size-5 text-error" />;
    default:
      return <HiInformationCircle className="size-5 text-primary-500" />;
  }
};

export function Notifications({ notifications, onMarkAsRead, onClearAll }: NotificationsProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-base border border-base rounded-lg shadow-lg p-4 w-80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiBell className="size-5 text-primary-500" />
            <h3 className="font-semibold text-base">Notifications</h3>
          </div>
          <Button.SM onClick={onClearAll}>Clear All</Button.SM>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-md ${
                notification.read ? "bg-muted" : "bg-subtle"
              }`}
            >
              <div className="flex items-start gap-3">
                {getIcon(notification.type)}
                <div className="flex-1">
                  <p className="text-sm text-base">{notification.message}</p>
                  <p className="text-xs text-muted mt-1">{notification.timestamp}</p>
                </div>
                {!notification.read && (
                  <Button.SM onClick={() => onMarkAsRead(notification.id)}>
                    Mark as read
                  </Button.SM>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 