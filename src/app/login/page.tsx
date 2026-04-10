import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bookmark as BookmarkIcon, Globe } from "lucide-react"
import { loginAction } from "@/app/actions"

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background blobs for premium look */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md space-y-8 relative">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center bg-blue-600 rounded-2xl p-4 text-white shadow-xl shadow-blue-500/20 mb-2">
            <BookmarkIcon className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">LinkVault</h1>
          <p className="text-muted-foreground text-lg">
            Sua central inteligente para organizar e acessar seus links favoritos.
          </p>
        </div>

        <div className="bg-card border border-border p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold">Boas-vindas</h2>
              <p className="text-sm text-muted-foreground">
                Entre com sua conta Google para sincronizar seus bookmarks entre todos os dispositivos.
              </p>
            </div>

            <form action={loginAction}>
              <Button 
                className="w-full h-14 rounded-2xl text-md font-semibold flex items-center justify-center gap-3 bg-foreground text-background hover:opacity-90 transition-opacity"
              >
                <Globe className="w-5 h-5" />
                Continuar com Google
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Seguro e Privado</span>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground leading-relaxed px-4">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground italic">
            "A melhor maneira de nunca perder uma ideia é salvá-la no lugar certo."
          </p>
        </div>
      </div>
    </div>
  )
}
