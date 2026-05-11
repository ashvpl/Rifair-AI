"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils"
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";

const MENU_ITEMS = {
  status: [
    { value: "online", icon: "solar:emoji-funny-circle-line-duotone", label: "Online" },
    { value: "focus", icon: "solar:mask-happly-line-duotone", label: "Focus" },
    { value: "offline", icon: "solar:moon-sleep-line-duotone", label: "Appear Offline" }
  ],
  profile: [
    { icon: "solar:settings-line-duotone", label: "Settings", action: "settings" },
  ],
  premium: [
    { 
      icon: "solar:star-bold", 
      label: "Upgrade to Pro", 
      action: "upgrade",
      iconClass: "text-amber-600",
      badge: { text: "20% off", className: "bg-amber-600 text-white text-[11px]" }
    },
  ],
  support: [
    { 
      icon: "solar:question-circle-line-duotone", 
      label: "Get help?", 
      action: "help",
      rightIcon: "solar:square-top-down-line-duotone"
    }
  ],
  account: [
    { icon: "solar:logout-2-bold-duotone", label: "Log out", action: "logout" }
  ]
};

export function UserDropdown() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const { planId } = useSubscription();
  const [selectedStatus, setSelectedStatus] = useState("online");

  if (!user) return null;

  const userData = {
    name: user.fullName || user.firstName || "User",
    username: user.primaryEmailAddress?.emailAddress || "@user",
    avatar: user.imageUrl,
    initials: user.firstName?.charAt(0) || "U",
    status: selectedStatus
  };

  const onAction = (action: string) => {
    switch (action) {
      case "logout":
        signOut(() => router.push("/"));
        break;
      case "settings":
        openUserProfile();
        break;
      case "upgrade":
        router.push("/pricing");
        break;
      default:
        console.log("Action:", action);
    }
  };

  const renderMenuItem = (item: any, index: number) => (
    <DropdownMenuItem 
      key={index}
      className={cn(item.badge || item.showAvatar || item.rightIcon ? "justify-between" : "", "p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors")}
      onClick={() => onAction(item.action)}
    >
      <span className="flex items-center gap-2.5 font-medium text-sm text-gray-700 dark:text-gray-300">
        <Icon
          icon={item.icon}
          className={`size-5 ${item.iconClass || "text-gray-400 dark:text-gray-500"}`}
        />
        {item.label}
      </span>
      {item.badge && (
        <Badge className={cn("px-1.5 py-0", item.badge.className)}>
          {item.badge.text}
        </Badge>
      )}
      {item.rightIcon && (
        <Icon
          icon={item.rightIcon}
          className="size-4 text-gray-400 dark:text-gray-500"
        />
      )}
      {item.showAvatar && (
        <Avatar className="size-6 border border-white dark:border-gray-800">
          <AvatarImage src={userData.avatar} alt={userData.name} />
          <AvatarFallback>{userData.initials}</AvatarFallback>
        </Avatar>
      )}
    </DropdownMenuItem>
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      online: "text-emerald-600 bg-emerald-100 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-500/50",
      offline: "text-gray-600 bg-gray-100 border-gray-300 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600",
      focus: "text-purple-600 bg-purple-100 border-purple-300 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-500/50"
    };
    return colors[status.toLowerCase()] || colors.online;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer group">
          <Avatar className="size-9 border-2 border-white dark:border-gray-800 shadow-sm transition-transform group-hover:scale-105">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback>{userData.initials}</AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white dark:border-gray-950",
            selectedStatus === "online" ? "bg-emerald-500" : selectedStatus === "focus" ? "bg-purple-500" : "bg-gray-400"
          )} />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-[280px] rounded-2xl bg-white dark:bg-[#0A0A0B] p-1.5 shadow-2xl border border-gray-200 dark:border-white/10" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center gap-3 p-2.5 mb-1.5">
          <Avatar className="size-11 border border-gray-100 dark:border-white/5 shadow-sm">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback>{userData.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{userData.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{userData.username}</p>
          </div>
          <Badge className={cn("px-1.5 py-0 h-5 text-[10px] font-bold uppercase tracking-wider", getStatusColor(userData.status))}>
            {userData.status}
          </Badge>
        </div>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <span className="flex items-center gap-2.5 font-medium text-sm text-gray-700 dark:text-gray-300">
                <Icon icon="solar:smile-circle-line-duotone" className="size-5 text-gray-400 dark:text-gray-500" />
                Update status
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-white dark:bg-[#0A0A0B] border border-gray-200 dark:border-white/10 rounded-xl p-1 shadow-xl">
                <DropdownMenuRadioGroup value={selectedStatus} onValueChange={setSelectedStatus}>
                  {MENU_ITEMS.status.map((status, index) => (
                    <DropdownMenuRadioItem 
                      key={index} 
                      value={status.value}
                      className="gap-2.5 p-2 rounded-lg cursor-pointer text-sm font-medium"
                    >
                      <Icon icon={status.icon} className="size-5 text-gray-400" />
                      {status.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-gray-100 dark:bg-white/5" />
        <DropdownMenuGroup>
          {MENU_ITEMS.profile.map(renderMenuItem)}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-gray-100 dark:bg-white/5" />
        <DropdownMenuGroup>
          {MENU_ITEMS.premium.map((item, index) => {
            let label = item.label;
            if (item.action === "upgrade") {
              if (planId === "free") label = "Upgrade to Starter";
              else if (planId === "starter") label = "Upgrade to Growth";
            }
            return renderMenuItem({ ...item, label }, index);
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-gray-100 dark:bg-white/5" />
        <DropdownMenuGroup>
          {MENU_ITEMS.support.map(renderMenuItem)}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-gray-100 dark:bg-white/5" />
        <DropdownMenuGroup>
          {MENU_ITEMS.account.map(renderMenuItem)}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
