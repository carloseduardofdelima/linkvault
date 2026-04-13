"use server"

import * as cheerio from "cheerio"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth, signIn, signOut } from "@/auth"
import bcrypt from "bcryptjs"

export async function loginAction() {
  await signIn("google")
}

export async function loginCredentialsAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  if (!email || !password) return { error: "Preencha todos os campos" }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
  } catch (error: any) {
    if (error.type === "CredentialsSignin") {
      return { error: "Email ou senha inválidos" }
    }
    throw error
  }
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Preencha todos os campos" }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: "Usuário já existe" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  })

  return { success: true }
}

export async function logoutAction() {
  await signOut()
}

export async function addLinkAction(url: string, collectionId?: string, tagNames: string[] = []) {
  try {
    // 1. Scraping metadados (silencioso - se falhar, usamos fallbacks)
    let title = "Bookmark"
    let description = null
    let thumbnail = null

    try {
      const response = await fetch(url, { 
        headers: { 
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        next: { revalidate: 3600 }
      })
      
      if (response.ok) {
        const html = await response.text()
        const $ = cheerio.load(html)
        
        title = $('meta[property="og:title"]').attr("content") || $("title").text() || "Untitled"
        description = $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || null
        thumbnail = $('meta[property="og:image"]').attr("content") || null
        
        // Tratamento básico de thumbnail com URL relativa
        if (thumbnail && thumbnail.startsWith("/")) {
          const urlObj = new URL(url)
          thumbnail = `${urlObj.protocol}//${urlObj.host}${thumbnail}`
        }
      } else {
        console.warn(`Scraping falhou com status ${response.status}. Usando fallbacks.`)
        // Caso o scraping falhe (403, 404, etc), tentamos pelo menos usar o domínio como título
        const urlObj = new URL(url)
        title = urlObj.hostname
      }
    } catch (scrapeError) {
      console.error("Erro durante o scraping:", scrapeError)
      const urlObj = new URL(url)
      title = urlObj.hostname
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

    // 3. Preparar tags (conectar existentes ou criar novas)
    const tagConnectOrCreate = tagNames.map(name => ({
      where: { name },
      create: { name }
    }))

    // 4. Salvar no banco
    const urlObj = new URL(url)
    const baseUrl = urlObj.host

    const newBookmark = await prisma.bookmark.create({
      data: {
        url: baseUrl,
        title: title.substring(0, 150),
        description: description ? description.substring(0, 250) : null,
        thumbnail: thumbnail,
        collectionId: targetCollectionId,
        tags: {
          connectOrCreate: tagConnectOrCreate
        }
      },
      include: {
        tags: true
      }
    })

    // 5. Revalidar a home pra atualizar a lista
    revalidatePath("/")
    
    return { success: true, bookmark: newBookmark }
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Falha desconhecida"
    console.error("Erro ao salvar link:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

export async function getTagsAction() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" }
    })
    return { success: true, tags }
  } catch (error) {
    return { success: false, tags: [] }
  }
}

export async function createTagAction(name: string) {
  try {
    const normalized = name.trim().toLowerCase()
    if (!normalized) return { success: false, error: "Nome da tag é obrigatório" }

    const tag = await prisma.tag.upsert({
      where: { name: normalized },
      update: {},
      create: { name: normalized }
    })

    revalidatePath("/")
    return { success: true, tag }
  } catch (error) {
    return { success: false, error: "Erro ao criar tag" }
  }
}

