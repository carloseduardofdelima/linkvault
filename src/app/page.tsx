import { Input } from "@/components/ui/input"
import { Search, Bookmark as BookmarkIcon } from "lucide-react"
import { AddLinkModal } from "@/components/AddLinkModal"
import { CreateTagModal } from "@/components/CreateTagModal"
import { UserMenu } from "@/components/UserMenu"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LinkCard } from "@/components/LinkCard"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await auth()
  const params = await searchParams
  const activeTag = typeof params.tag === "string" ? params.tag : "Todos"
  
  // Puxar todas as tags do usuário/banco para usar como "Categorias/Coleções"
  const allTags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { bookmarks: true }
      }
    },
    orderBy: { name: "asc" }
  })

  // Total de links para o botão "Todos"
  const totalLinks = await prisma.bookmark.count()

  // Puxar links dinamicamente do banco com filtros
  const linksDB = await prisma.bookmark.findMany({
    where: {
      ...(activeTag !== "Todos" ? {
        tags: {
          some: { name: activeTag }
        }
      } : {}),
    },
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
            <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
              <div className="bg-blue-600 rounded-lg p-2 text-white">
                <BookmarkIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-xl leading-tight text-foreground">LinkVault</h1>
                <p className="text-xs text-muted-foreground">Sua biblioteca de links unificada</p>
              </div>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-3xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Buscar por título, URL ou tag..." 
                className="w-full pl-10 bg-muted/50 border-border h-12 rounded-xl text-md focus-visible:ring-blue-600 focus-visible:bg-background transition-colors"
                defaultValue={activeTag !== "Todos" ? `#${activeTag}` : ""}
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

      {/* Tags Scroller (Unified with Collections) */}
      <div className="bg-card/60 border-b backdrop-blur-md sticky top-20 z-0 transition-colors">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3 h-16 overflow-x-auto no-scrollbar py-2">
            {/* Botão Todos */}
            <Link
              href="/"
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                activeTag === "Todos" 
                  ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10" 
                  : "bg-card border-border text-muted-foreground hover:border-slate-300 dark:hover:border-slate-700 hover:bg-muted"
              }`}
            >
              {activeTag === "Todos" && <span className="text-primary-foreground/70">🌐</span>}
              Todos
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTag === "Todos" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {totalLinks}
              </span>
            </Link>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Tags dinâmicas atuando como categorias */}
            {allTags.map((tag: any) => (
              <Link
                key={tag.id}
                href={`/?tag=${tag.name}`}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                  activeTag === tag.name 
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10" 
                    : "bg-card border-border text-muted-foreground hover:border-slate-300 dark:hover:border-slate-700 hover:bg-muted"
                }`}
              >
                {activeTag !== tag.name && <span className="w-2 h-2 rounded-full bg-slate-400" />}
                {tag.name}
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTag === tag.name ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {tag._count.bookmarks}
                </span>
              </Link>
            ))}

            <div className="w-px h-6 bg-border mx-2" />
            
            <CreateTagModal />
          </div>
        </div>
      </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-8 mt-6">

        {linksDB.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl">
            <BookmarkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground">Nenhum link encontrado</h3>
            <p className="text-muted-foreground">Tente outra busca ou remova os filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {linksDB.map((link: any) => (
              <LinkCard key={link.id} link={link} activeTag={activeTag} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

