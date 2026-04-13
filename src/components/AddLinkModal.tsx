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
import { Plus, CheckCircle2, X } from "lucide-react"
import { addLinkAction, getTagsAction } from "@/app/actions"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"

const formSchema = z.object({
  url: z.string().url({ message: "Insira uma URL válida (ex: https://...)" })
})

type FormValues = z.infer<typeof formSchema>

export function AddLinkModal() {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorStatus, setErrorStatus] = useState<string | null>(null)
  
  const [availableTags, setAvailableTags] = useState<{id: string, name: string}[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState("")

  useEffect(() => {
    if (open) {
      getTagsAction().then(res => {
        if (res.success) setAvailableTags(res.tags)
      })
    }
  }, [open])

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })

  const addTag = (tagName: string) => {
    const normalized = tagName.trim().toLowerCase()
    if (normalized && !selectedTags.includes(normalized)) {
      setSelectedTags([...selectedTags, normalized])
    }
    setNewTagInput("")
  }

  const removeTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagName))
  }

  const onSubmit = async (data: FormValues) => {
    setErrorStatus(null)
    const result = await addLinkAction(data.url, undefined, selectedTags)
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
        reset()
        setSelectedTags([])
      }, 1500)
    } else {
      setErrorStatus(result.error || "Ocorreu um erro ao salvar o link.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl font-medium shadow-sm shadow-blue-600/20 transition-all text-white">
            <Plus className="w-5 h-5 mr-2" />
            Novo Link
          </Button>
        }
      />
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
                Cole a URL. Nosso scraper vai capturar a imagem e a descrição pra você.
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
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[32px] p-2 border border-dashed rounded-lg bg-slate-50/50">
                  {selectedTags.length === 0 && <span className="text-xs text-slate-400 italic">Nenhuma tag selecionada...</span>}
                  {selectedTags.map(tag => (
                    <Badge key={tag} className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none flex items-center gap-1 px-2 py-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="Adicionar tag..." 
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag(newTagInput)
                      }
                    }}
                    className="h-10"
                  />
                  <Button type="button" variant="outline" onClick={() => addTag(newTagInput)} className="h-10">
                    Add
                  </Button>
                </div>

                {availableTags.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">Sugestões</p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {availableTags.filter(t => !selectedTags.includes(t.name)).slice(0, 10).map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => addTag(tag.name)}
                          className="text-xs px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {errorStatus && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                  <span className="text-destructive text-sm font-medium">{errorStatus}</span>
                </div>
              )}

              <DialogFooter className="pt-4 border-t mt-4">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-500">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                  {isSubmitting ? "Extraindo..." : "Salvar Link"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
