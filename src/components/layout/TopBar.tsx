import { ChevronDown, Layers, Plus, Settings, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLVEWorkspace } from "../../context/LVEWorkspaceContext";
import Button from "../ui/ButtonComponent";
import { Badge } from "../ui/Badge";
import { ModeToggle } from "../ui/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";

export function TopBar() {
  const { user, userSegment } = useAuth();
  const {
    currentStreamId,
    currentTenantLabel,
    setCurrentStreamId,
    streamOptions,
  } = useLVEWorkspace();
  const currentStreamLabel =
    streamOptions.find((option) => option.id === currentStreamId)?.label ??
    streamOptions[0].label;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-pane-menu px-4">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              ATX Admin Platform
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Transactional workspace shell
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 xl:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 gap-2 border-border bg-secondary/40 px-3 hover:bg-secondary hover:text-foreground"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-xs font-semibold text-primary">
                  A
                </div>
                <span className="text-sm font-medium">{currentTenantLabel}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Tenant</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-xs font-semibold text-primary">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium">{currentTenantLabel}</p>
                  <p className="text-xs text-muted-foreground">Admin Platform</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 gap-2 border-border bg-background px-3 hover:bg-secondary hover:text-foreground"
              >
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{currentStreamLabel}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Data Stream</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {streamOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => setCurrentStreamId(option.id)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-border bg-background px-3 hover:bg-secondary hover:text-foreground"
          onClick={() => {
            // Reserved for cross-module quick create flows.
          }}
        >
          <Plus className="h-4 w-4" />
          Quick Create
        </Button>

        <Badge
          variant="outline"
          className={
            userSegment === "internal"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-accent/30 bg-accent/10 text-accent"
          }
        >
          {userSegment === "internal" ? "Staff" : "Partner"}
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 px-3 text-muted-foreground hover:text-foreground"
          onClick={() => {
            // Reserved for global settings.
          }}
        >
          <Settings className="h-4 w-4" />
          <span className="hidden lg:inline">Settings</span>
        </Button>

        <ModeToggle />

        <div className="flex items-center gap-2 border-l border-border pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium">{user?.name ?? "Admin User"}</p>
            <p className="text-[10px] text-muted-foreground">
              {userSegment === "internal" ? "Platform Admin" : "Partner Admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
