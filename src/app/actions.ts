"use server"

import * as cheerio from "cheerio"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth, signIn, signOut } from "@/auth"

export async function loginAction() {
  await signIn("google")
}

export async function logoutAction() {
  await signOut()
}

export async function addLinkAction(url: string, collectionId?: string) {
  try {
    // 1. Scraping metadados
    const response = await fetch(url, { headers: { "User-Agent": "bot" } })
    if (!response.ok) throw new Error("A requisição para o site falhou")
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    const title = $('meta[property="og:title"]').attr("content") || $("title").text() || "Untitled"
    const description = $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || null
    let thumbnail = $('meta[property="og:image"]').attr("content") || null
    
    // Tratamento básico de thumbnail com URL relativa
    if (thumbnail && thumbnail.startsWith("/")) {
      const urlObj = new URL(url)
      thumbnail = `${urlObj.protocol}//${urlObj.host}${thumbnail}`
    }

    // 2. Pegar usuário real da sessão
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Você precisa estar logado para salvar links." }
    }

    let targetCollectionId = collectionId
    
    if (!targetCollectionId) {
      let coll = await prisma.collection.findFirst({
        where: { userId: session.user.id }
      })
      
      if (!coll) {
        coll = await prisma.collection.create({
          data: {
            name: "Meus Favoritos",
            color: "bg-blue-500",
            userId: session.user.id
          }
        })
      }
      targetCollectionId = coll.id
    }

    // 3. Salvar no banco
    const urlObj = new URL(url)
    const baseUrl = urlObj.host // para mostrar limpo igual o design do Notion

    const newBookmark = await prisma.bookmark.create({
      data: {
        url: baseUrl, // ou url completo
        title: title.substring(0, 150),
        description: description ? description.substring(0, 250) : null,
        thumbnail: thumbnail,
        collectionId: targetCollectionId,
      }
    })

    // 4. Revalidar a home pra atualizar a lista
    revalidatePath("/")
    
    return { success: true, bookmark: newBookmark }
  } catch (error) {
    console.error("Erro ao salvar link:", error)
    return { success: false, error: "Falha ao processar a URL. Verifique a validade." }
  }
}
