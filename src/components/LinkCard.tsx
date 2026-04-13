"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

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
            <p className="text-sm text-muted-foreground line-clamp-2 mb-1 leading-relaxed">
              {link.description}
            </p>
            </div>
          </div>
          
          <div className="mt-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-blue-600 transition-colors truncate w-full">
              <ExternalLink className="w-3.5 h-3.5" />
              {link.url}
            </span>
            <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
              {link.tags.map((tag) => (
                <Link 
                  href={`/?tag=${tag.name}`}
                  key={tag.id}
                >
                  <Badge 
                    variant="secondary" 
                    className={`font-medium border-0 rounded-md px-2.5 py-0.5 transition-colors ${
                      activeTag === tag.name 
                        ? "bg-blue-600 text-white" 
                        : "bg-muted hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 text-muted-foreground"
                    }`}
                  >
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
