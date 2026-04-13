"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Tag as TagIcon, CheckCircle2 } from "lucide-react"
import { createTagAction } from "@/app/actions"

const formSchema = z.object({
  name: z.string().min(1, { message: "O nome da tag não pode estar vazio" }).max(20, { message: "Máximo 20 caracteres" })
})

type FormValues = z.infer<typeof formSchema>

export function CreateTagModal() {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorStatus, setErrorStatus] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })

  const onSubmit = async (data: FormValues) => {
    setErrorStatus(null)
    const result = await createTagAction(data.name)
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
        reset()
      }, 1500)
    } else {
      setErrorStatus(result.error || "Erro ao criar tag")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border border-dashed border-border text-muted-foreground hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-sm font-medium ml-2">
            <TagIcon className="w-4 h-4" />
            Nova Tag
          </button>
        }
      />
      <DialogContent className="sm:max-w-[400px]">
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-in zoom-in" />
            <h2 className="text-xl font-semibold">Tag criada!</h2>
            <p className="text-slate-500 text-center">Agora você pode usá-la em seus links.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Criar Nova Tag</DialogTitle>
              <DialogDescription>
                Tags ajudam a agrupar links de forma transversal às coleções.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 mt-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-slate-700">Nome da Tag</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">#</span>
                  <Input 
                    id="name"
                    placeholder="marketing, curso, design..."
                    {...register("name")}
                    className={`h-11 pl-7 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name.message}</p>}
              </div>

              {errorStatus && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                  <span className="text-destructive text-sm font-medium">{errorStatus}</span>
                </div>
              )}

              <DialogFooter className="pt-4 border-t mt-4">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-500">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                  {isSubmitting ? "Criando..." : "Criar Tag"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
