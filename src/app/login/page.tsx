import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bookmark as BookmarkIcon, Globe } from "lucide-react"
import { loginAction } from "@/app/actions"

import { AuthForm } from "@/components/AuthForm"

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Background blobs for premium look */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-24 items-center relative">
        {/* Left side: Hero/Title */}
        <div className="text-center lg:text-left space-y-6">
          <div className="inline-flex items-center justify-center bg-blue-600 rounded-3xl p-5 text-white shadow-2xl shadow-blue-500/30 mb-2">
            <BookmarkIcon className="w-12 h-12" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter text-white">
              LinkVault
            </h1>
            <p className="text-slate-300 text-xl lg:text-2xl max-w-lg leading-relaxed">
              Sua central inteligente para organizar e acessar seus links favoritos com um clique.
            </p>
          </div>
          
          <div className="hidden lg:block pt-8">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-slate-800" />
                ))}
              </div>
              <span className="text-slate-300">Junte-se a milhares de usuários organizados.</span>
            </div>
          </div>
        </div>

        {/* Right side: Form */}
        <div className="w-full max-w-md mx-auto lg:mr-0">
          <div className="bg-[#0f0f0f] border border-white/5 p-8 lg:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  )
}

