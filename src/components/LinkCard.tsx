"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Pencil } from "lucide-react"
import Link from "next/link"
import { EditLinkModal } from "./EditLinkModal"

interface LinkCardProps {
  link: {
    id: string
    title: string
    description: string | null
    url: string
    thumbnail: string | null
    clicks: number
    tags: { id: string; name: string }[]
  }
  activeTag: string
}

export function LinkCard({ link, activeTag }: LinkCardProps) {
  const handleCardClick = () => {
    const url = link.url.startsWith('http') ? link.url : `https://${link.url}`
    window.open(url, '_blank', 'noreferrer')
  }

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border flex flex-col group rounded-2xl h-full">
        <div className="relative h-48 overflow-hidden bg-muted">
          <img 
            src={link.thumbnail || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80"} 
            alt={link.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-foreground shadow-sm border border-border flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            {link.clicks} cliques
          </div>
          <EditLinkModal 
            link={link}
            trigger={
              <button className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm p-2 rounded-full text-foreground shadow-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card hover:scale-110">
                <Pencil className="w-4 h-4" />
              </button>
            }
          />
        </div>
        <CardContent className="px-5 flex flex-col flex-1">
          <div className="flex items-start gap-3 flex-1">
            <img 
              src={`https://www.google.com/s2/favicons?domain=${link.url}&sz=32`}
              alt=""
              className="w-6 h-6 rounded object-contain shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                {link.title}
              </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
              {link.description}
            </p>
            </div>
          </div>
          
          <div className="mt-auto">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors truncate w-full mb-3">
              <ExternalLink className="w-3.5 h-3.5" />
              {link.url}
            </span>
            {link.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                {link.tags.map((tag) => (
                  <Link 
                    href={`/?tag=${tag.name}`}
                    key={tag.id}
                    className="no-underline"
                  >
                    <Badge 
                      variant="outline"
                      className={`text-xs font-medium rounded-full px-2.5 py-0.5 transition-all cursor-pointer ${
                        activeTag === tag.name 
                          ? "bg-blue-500 text-white border-blue-500" 
                          : "border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
