import { ReactNode, useState } from "react";
import { TopBar } from "./TopBar";
import { MenuPane } from "./MenuPane";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  return (
    <div className="flex h-screen min-h-0 min-w-0 w-full flex-col overflow-hidden bg-background">
      <TopBar />
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <MenuPane
          collapsed={isMenuCollapsed}
          onToggleCollapse={() => setIsMenuCollapsed((prev) => !prev)}
        />
        <main className="flex min-h-0 min-w-0 w-full flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
