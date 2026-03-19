import { Outlet } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppMobileNav } from "../components/AppMobileNav";
import { AppSidebar } from "../components/AppSidebar";
import { AppTopbar } from "../components/AppTopbar";
import { NotificationsPanel } from "../components/NotificationsPanel";
import { QuickLinksFooter } from "../components/QuickLinksFooter";
import { hrService } from "../services/hrService";
import type { Notification } from "../types/hr";
import type { UserRole } from "../types/auth";
import type { NavItem } from "../types/navigation";

interface AppLayoutProps {
  onSignOut: () => void;
  items: NavItem[];
  workspaceLabel: string;
  userRole: UserRole;
}

export function AppLayout({ onSignOut, items, workspaceLabel, userRole }: AppLayoutProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const data = await hrService.getNotifications(userRole);
      setNotifications(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load notifications.";
      setNotificationsError(message);
    } finally {
      setNotificationsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleToggleNotifications = () => {
    setShowNotifications((previous) => {
      const next = !previous;
      if (next) {
        void loadNotifications();
      }
      return next;
    });
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      return;
    }
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      await hrService.markNotificationsRead(userRole);
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to mark notifications read.";
      setNotificationsError(message);
    } finally {
      setNotificationsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        <AppSidebar items={items} workspaceLabel={workspaceLabel} />
        <div className="min-w-0 flex-1">
          <AppTopbar
            onSignOut={onSignOut}
            items={items}
            workspaceLabel={workspaceLabel}
            onToggleNotifications={handleToggleNotifications}
            unreadNotifications={unreadCount}
            notificationsOpen={showNotifications}
          />
          <main className="px-4 py-5 pb-24 md:px-6 md:py-6 lg:px-8 lg:pb-8">
            <div className="mx-auto w-full max-w-[1440px]">
              {showNotifications ? (
                <NotificationsPanel
                  notifications={notifications}
                  loading={notificationsLoading}
                  error={notificationsError}
                  unreadCount={unreadCount}
                  onMarkAllRead={handleMarkAllRead}
                />
              ) : null}
              <Outlet />
              <QuickLinksFooter items={items} />
            </div>
          </main>
        </div>
      </div>
      <AppMobileNav items={items} />
    </div>
  );
}
