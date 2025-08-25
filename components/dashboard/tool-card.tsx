"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ToolCardProps {
  title: string
  description: string
  icon: React.ReactNode
  preview?: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function ToolCard({
  title,
  description,
  icon,
  preview,
  badge,
  badgeVariant = "secondary",
  onClick,
  disabled = false,
  className
}: ToolCardProps) {
  const hasPreview = Boolean(preview)
  return (
    <Card
      className={cn(
        "group relative overflow-hidden h-full",
        "cursor-pointer bg-card border border-border rounded-lg shadow-none transition-all",
        disabled && "opacity-70 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {hasPreview ? (
        <div className="relative h-36 w-full overflow-hidden bg-surface">
          {preview && preview.startsWith('http') ? (
            <Image
              src={preview}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-8xl opacity-20 text-muted-foreground">
              {icon}
            </div>
          )}
          {badge && (
            <div className="absolute top-2 right-2">
              <Badge variant={badgeVariant} className="text-[10px] px-2 py-0.5">
                {badge}
              </Badge>
            </div>
          )}
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/60 text-foreground/60 border border-border/50 flex-shrink-0">
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-semibold mb-0.5 line-clamp-1">{title}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-2">{description}</CardDescription>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      ) : (
        <CardContent className="p-2">
          {badge && (
            <div className="flex justify-end">
              <Badge variant={badgeVariant} className="text-[10px] px-2 py-0.5">{badge}</Badge>
            </div>
          )}
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-background text-foreground/70 border border-border flex-shrink-0">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-[13.5px] font-semibold mb-0.5 leading-5 line-clamp-1">{title}</CardTitle>
              <CardDescription className="text-[12px] text-muted-foreground leading-5 line-clamp-2">{description}</CardDescription>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
