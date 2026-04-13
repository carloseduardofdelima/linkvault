"use client"
import { useState, useEffect } from "react"
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
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Trash2, CheckCircle2, Pencil } from "lucide-react"
import { updateLinkAction, deleteLinkAction, getTagsAction } from "@/app/actions"

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório")
})

type FormValues = z.infer<typeof formSchema>

interface EditLinkModalProps {
  link: {
    id: string
    title: string
    description: string | null
    url: string
    tags: { id: string; name: string }[]
  }
}

export function EditLinkModal({ link }: EditLinkModalProps) {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const [availableTags, setAvailableTags] = useState<{id: string, name: string}[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>(link.tags.map(t => t.name))
  const [newTagInput, setNewTagInput] = useState("")

  useEffect(() => {
    if (open) {
      getTagsAction().then(res => {
        if (res.success) setAvailableTags(res.tags)
      })
      setSelectedTags(link.tags.map(t => t.name))
    }
  }, [open, link.tags])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: link.title }
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
    const result = await updateLinkAction(link.id, data.title, selectedTags)
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
        reset()
        window.location.reload()
      }, 1000)
    }
  }

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja deletar este link?")) {
      setDeleting(true)
      await deleteLinkAction(link.id)
      window.location.reload()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button 
        className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm p-2 rounded-full text-foreground shadow-sm border border-border hover:bg-card hover:scale-110 transition-transform z-20 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <Pencil className="w-4 h-4" />
      </button>
      <DialogContent className="sm:max-w-[425px]">
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-in zoom-in" />
            <h2 className="text-xl font-semibold">Link atualizado!</h2>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Editar Link</DialogTitle>
              <DialogDescription>
                Altere o título e as tags do link.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 mt-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold">Título</Label>
                <Input 
                  id="title"
                  {...register("title")}
                  className={`h-11 ${errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {errors.title && <p className="text-sm text-red-500 font-medium">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[32px] p-2 border border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                  {selectedTags.length === 0 && <span className="text-xs text-slate-400 italic">Nenhuma tag selecionada...</span>}
                  {selectedTags.map(tag => (
                    <Badge key={tag} className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 border-none flex items-center gap-1 px-2 py-1">
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
                          className="text-xs px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-4 border-t mt-4 flex justify-between">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="mr-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? "Deletando..." : "Deletar"}
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-500">
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                    Salvar
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
