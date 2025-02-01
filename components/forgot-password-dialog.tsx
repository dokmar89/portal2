"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function ForgotPasswordDialog() {
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Zde by normálně bylo volání API pro odeslání odkazu pro reset hesla
    console.log("Odesílání odkazu pro reset hesla:", email)
    toast({
      title: "Odkaz pro reset hesla odeslán",
      description: "Zkontrolujte prosím svůj e-mail pro odkaz na reset hesla.",
    })
    // Zde by mělo být zavření dialogu
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="px-0">Zapomenuté heslo?</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset hesla</DialogTitle>
          <DialogDescription>
            Zadejte svou e-mailovou adresu a my vám pošleme odkaz pro reset hesla.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Odeslat odkaz pro reset</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

