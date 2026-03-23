import { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { MenuPane } from "./MenuPane";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <MenuPane />
        <main className="flex-1 flex overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
