import { ChevronDown, Layers, User, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/ButtonComponent";
import { Badge } from "../ui/Badge";
import { ModeToggle } from "../ui/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/DropdownMenu";

export function TopBar() {
  const { userSegment } = useAuth();

  return (
    <header className="h-14 bg-pane-menu border-b border-border flex items-center justify-between px-4 shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              ATX Admin Platform
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Content & Experience Management
            </p>
          </div>
        </div>
      </div>

      {/* Center Section - Tenant & Stream Controls */}
      <div className="flex items-center gap-3">
        {/* Tenant Switch */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-9 px-3 gap-2 bg-secondary/50 border-border hover:bg-secondary hover:text-foreground"
            >
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                A
              </div>
              <span className="text-sm font-medium">ATX Organization</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuLabel>Tenant</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                A
              </div>
              <div>
                <p className="text-sm font-medium">ATX Organization</p>
                <p className="text-xs text-muted-foreground">Admin Platform</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Stream Switch */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-9 px-3 gap-2 bg-accent/10 border-accent/30 hover:bg-accent/20 text-accent"
            >
              <Layers className="w-4 h-4" />
              <span className="text-sm font-medium">Default Stream</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuLabel>Data Stream</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="text-sm">Default Stream</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="text-sm">CRM Stream</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right Section - User & Controls */}
      <div className="flex items-center gap-3">
        {/* Segment Badge */}
        <Badge
          variant="outline"
          className={
            userSegment === "internal"
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-accent/10 text-accent border-accent/30"
          }
        >
          {userSegment === "internal" ? "Staff" : "Partner"}
        </Badge>

        {/* Settings Control */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            /* Handle settings */
          }}
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* Theme Toggle */}
        <ModeToggle />

        {/* User Chip */}
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-[10px] text-muted-foreground">
              {userSegment === "internal" ? "Platform Admin" : "Partner Admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
