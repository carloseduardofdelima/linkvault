import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar" 
import { LogIn, LogOut, User } from "lucide-react"
import { Session } from "next-auth"
import Link from "next/link"
import { logoutAction } from "@/app/actions"

export async function UserMenu({ session }: { session: Session | null }) {

  if (!session?.user) {
    return (
      <Link href="/login">
        <Button variant="outline" className="rounded-xl border-border bg-card h-11 px-6 font-medium text-foreground hover:bg-muted transition-colors">
          <LogIn className="w-4 h-4 mr-2" />
          Entrar
        </Button>
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-4 text-foreground">
      <div className="flex items-center gap-2 text-right">
        <div className="hidden lg:block">
          <p className="text-sm font-semibold leading-none mb-1">{session.user.name}</p>
          <p className="text-xs text-muted-foreground leading-none truncate max-w-[150px]">{session.user.email}</p>
        </div>
        <Avatar className="w-10 h-10 rounded-xl border border-border bg-muted">
          <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
          <AvatarFallback className="bg-muted rounded-xl">
            <User className="w-5 h-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      </div>
      
      <form action={logoutAction}>
        <Button variant="ghost" size="icon" type="submit" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 w-10 rounded-xl">
          <LogOut className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
