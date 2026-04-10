import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, ExternalLink, Bookmark as BookmarkIcon } from "lucide-react"
import { AddLinkModal } from "@/components/AddLinkModal"
import { UserMenu } from "@/components/UserMenu"
import { ThemeToggle } from "@/components/ThemeToggle"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export const dynamic = "force-dynamic"

export default async function Home() {
  const session = await auth()
  
  const collections = [
    { name: "Todos", count: 78, active: true },
    { name: "Design Inspiration", count: 12, color: "bg-purple-500" },
    { name: "Development", count: 24, color: "bg-blue-500" },
    { name: "Marketing", count: 8, color: "bg-pink-500" },
    { name: "Productivity", count: 15, color: "bg-emerald-500" },
    { name: "Learning", count: 19, color: "bg-orange-500" },
  ]

  // Puxar links dinamicamente do banco através da Collection associada
  const linksDB = await prisma.bookmark.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tags: true
    }
  })

  return (
    <div className="min-h-screen bg-background pb-12 transition-colors duration-300">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 transition-colors">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-blue-600 rounded-lg p-2 text-white">
                <BookmarkIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-xl leading-tight text-foreground">LinkVault</h1>
                <p className="text-xs text-muted-foreground">Organize seus links favoritos</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-3xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Buscar por título, URL ou tag..." 
                className="w-full pl-10 bg-muted/50 border-border h-12 rounded-xl text-md focus-visible:ring-blue-600 focus-visible:bg-background transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <ThemeToggle />
              <div className="w-px h-8 bg-border mx-1 hidden sm:block" />
              <AddLinkModal />
              <div className="w-px h-8 bg-border mx-1 hidden sm:block" />
              <UserMenu session={session} />
            </div>
          </div>
        </div>
      </header>

      {/* Collections Scroller */}
      <div className="bg-card/60 border-b backdrop-blur-md sticky top-20 z-0 transition-colors">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3 h-16 overflow-x-auto no-scrollbar py-2">
            {collections.map((col, idx) => (
              <button
                key={idx}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                  col.active 
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10" 
                    : "bg-card border-border text-muted-foreground hover:border-slate-300 dark:hover:border-slate-700 hover:bg-muted"
                }`}
              >
                {!col.active && col.color && (
                  <span className={`w-2 h-2 rounded-full ${col.color}`} />
                )}
                {col.active && <span className="text-primary-foreground/70">🌐</span>}
                {col.name}
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  col.active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {col.count}
                </span>
              </button>
            ))}
            <button className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border border-dashed border-border text-muted-foreground hover:border-slate-400 hover:text-foreground hover:bg-muted transition-all text-sm font-medium ml-2">
              <Plus className="w-4 h-4" />
              Nova Coleção
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 pt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Todos os Links</h2>
          <p className="text-muted-foreground mt-1">{linksDB.length} links</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {linksDB.map((link) => (
            <Card key={link.id} className="overflow-hidden bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border flex flex-col group rounded-2xl">
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
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {link.description}
                  </p>
                </div>
                
                <div className="mt-auto">
                  <a href={`https://${link.url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors mb-4 truncate w-full">
                    <ExternalLink className="w-3.5 h-3.5" />
                    {link.url}
                  </a>
                  <div className="flex flex-wrap gap-2">
                    {link.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium border-0 rounded-md px-2.5 py-0.5">
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
