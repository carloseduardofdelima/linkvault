"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react"
import { loginAction, loginCredentialsAction, registerAction } from "@/app/actions"

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    let result
    if (mode === "login") {
      result = await loginCredentialsAction(formData)
    } else {
      result = await registerAction(formData)
      if (result?.success) {
        setMode("login")
        setError("Conta criada com sucesso! Faça login.")
      }
    }

    if (result?.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          {mode === "login" ? "Boas-vindas" : "Crie sua conta"}
        </h2>
        <p className="text-sm text-slate-300 font-medium">
          {mode === "login" 
            ? "Entre para acessar sua biblioteca de links." 
            : "Comece sua jornada de organização agora."}
        </p>
      </div>

      <form action={loginAction} className="w-full">
        <Button 
          type="submit"
          variant="outline"
          className="w-full h-12 rounded-xl text-md font-semibold flex items-center justify-center gap-3 transition-all hover:bg-white/10 border-white/10 text-white"
        >
          <Globe className="w-5 h-5 text-blue-400" />
          Continuar com Google
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
          <span className="bg-[#0a0a0a] px-3">Ou use seu email</span>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-300 ml-1">Nome</Label>
            <div className="relative group">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
              <Input 
                id="name" 
                name="name" 
                placeholder="Como quer ser chamado?" 
                className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-white placeholder:text-slate-500"
                required={mode === "register"}
              />
            </div>
          </div>
        )}
        
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-300 ml-1">Email</Label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            <Input 
              id="email" 
              name="email" 
              type="email"
              placeholder="seu@exemplo.com" 
              className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-white placeholder:text-slate-500"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-300">Senha</Label>
            {mode === "login" && (
              <button type="button" className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-tight">
                Esqueceu?
              </button>
            )}
          </div>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            <Input 
              id="password" 
              name="password" 
              type="password"
              placeholder="Sua senha secreta" 
              className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-white placeholder:text-slate-500"
              required
            />
          </div>
        </div>

        {error && (
          <div className={`p-3 rounded-lg text-xs font-medium border ${error.includes("sucesso") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-destructive/10 border-destructive/20 text-destructive-foreground"} text-center animate-in fade-in slide-in-from-top-1`}>
            {error}
          </div>
        )}

        <Button 
          disabled={loading}
          className="w-full h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 group transition-all"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              {mode === "login" ? "Acessar LinkVault" : "Criar Minha Conta"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </form>

      <div className="text-center pt-2">
        <button 
          onClick={() => {
            setMode(mode === "login" ? "register" : "login")
            setError(null)
          }}
          className="text-[13px] font-semibold text-slate-400 hover:text-white transition-colors"
        >
          {mode === "login" 
            ? <span className="flex items-center justify-center gap-1.5">Não tem uma conta? <span className="text-blue-400">Cadastre-se</span></span>
            : <span className="flex items-center justify-center gap-1.5">Já possui uma conta? <span className="text-blue-400">Faça login</span></span>}
        </button>
      </div>

    </div>
  )
}

