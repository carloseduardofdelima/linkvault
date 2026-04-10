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
import { Plus, CheckCircle2 } from "lucide-react"
import { addLinkAction } from "@/app/actions"

const formSchema = z.object({
  url: z.string().url({ message: "Insira uma URL válida (ex: https://...)" })
})

type FormValues = z.infer<typeof formSchema>

export function AddLinkModal() {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorStatus, setErrorStatus] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })

  const onSubmit = async (data: FormValues) => {
    setErrorStatus(null)
    // Ação real do servidor que fara o scraping e o insert no Postgres
    const result = await addLinkAction(data.url)
    
    if (result.success) {
      console.log("Salvo no BD:", result.bookmark)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
        reset()
      }, 1500)
    } else {
      setErrorStatus(result.error || "Ocorreu um erro ao salvar o link.")
      console.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl font-medium shadow-sm shadow-blue-600/20 transition-all text-white" />
        }
      >
        <Plus className="w-5 h-5 mr-2" />
        Novo Link
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-in zoom-in" />
            <h2 className="text-xl font-semibold">Link salvo!</h2>
            <p className="text-slate-500 text-center">O título e descrição estão sendo processados.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Adicionar Bookmark</DialogTitle>
              <DialogDescription>
                Cole a URL. Nosso scraper vai capturar a imagem e a descrição pra você (Open Graph).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 mt-2">
              <div className="space-y-2">
                <Label htmlFor="url" className="font-semibold text-slate-700">URL do Site</Label>
                <Input 
                  id="url"
                  placeholder="https://exemplo.com/dica-de-codigo"
                  {...register("url")}
                  className={`h-11 ${errors.url ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {errors.url && <p className="text-sm text-red-500 font-medium">{errors.url.message}</p>}
                {errorStatus && (
                  <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                    <span className="text-destructive text-sm font-medium">{errorStatus}</span>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-4 border-t mt-4">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-500">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Extraindo...
                    </span>
                  ) : "Salvar Link"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
