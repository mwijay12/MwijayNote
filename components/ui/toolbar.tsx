"use client";

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import { cn } from "@/lib/utils";
import type React from "react";

export function Toolbar({
  className,
  ...props
}: ToolbarPrimitive.Root.Props): React.ReactElement {
  return (
    <ToolbarPrimitive.Root
      className={cn(
        "relative flex flex-wrap items-center gap-1.5 rounded-2xl border bg-card/80 backdrop-blur-md p-1.5 text-card-foreground shadow-2xl",
        className,
      )}
      data-slot="toolbar"
      {...props}
    />
  );
}

export function ToolbarButton({
  className,
  ...props
}: ToolbarPrimitive.Button.Props): React.ReactElement {
  return (
    <ToolbarPrimitive.Button
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-accent/20 active:scale-95 disabled:opacity-50",
        className
      )}
      data-slot="toolbar-button"
      {...props}
    />
  );
}

export function ToolbarLink({
  className,
  ...props
}: ToolbarPrimitive.Link.Props): React.ReactElement {
  return (
    <ToolbarPrimitive.Link
      className={cn(className)}
      data-slot="toolbar-link"
      {...props}
    />
  );
}

export function ToolbarInput({
  className,
  ...props
}: ToolbarPrimitive.Input.Props): React.ReactElement {
  return (
    <ToolbarPrimitive.Input
      className={cn(className)}
      data-slot="toolbar-input"
      {...props}
    />
  );
}

export function ToolbarGroup({
  className,
  ...props
}: ToolbarPrimitive.Group.Props): React.ReactElement {
  return (
    <ToolbarPrimitive.Group
      className={cn("flex items-center gap-1.5", className)}
      data-slot="toolbar-group"
      {...props}
    />
  );
}

export function ToolbarSeparator({
  className,
  ...props
}: ToolbarPrimitive.Separator.Props): React.ReactElement {
  return (
    <ToolbarPrimitive.Separator
      className={cn(
        "shrink-0 bg-border/40 data-[orientation=horizontal]:my-0.5 data-[orientation=vertical]:my-1.5 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:not-[[class^='h-']]:not-[[class*='_h-']]:self-stretch",
        className,
      )}
      data-slot="toolbar-separator"
      {...props}
    />
  );
}

export { ToolbarPrimitive };
