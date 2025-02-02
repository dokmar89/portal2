"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Název e-shopu musí mít alespoň 2 znaky.",
  }),
  url: z.string().url({
    message: "Zadejte prosím platnou URL adresu.",
  }),
  sector: z.enum(["online_gambling", "sexual_content", "pyrotechnics", "firearms", "tobacco", "alcohol", "adult_content", "chemicals", "other"], {
    required_error: "Vyberte sektor produktů.",
  }),
  integrationMethod: z.enum(["api", "modal", "sdk"], {
    required_error: "Vyberte metodu integrace.",
  }),
  contractType: z.enum(["two_year", "no_contract"], {
    required_error: "Vyberte typ smlouvy.",
  }),
});

export function AddEshopDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      sector: "other",
      integrationMethod: "api",
      contractType: "no_contract",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (user?.uid) {
        const token = await user.getIdToken();
        const response = await fetch('/api/addEshop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            data: {
              ...values,
              companyId: user.uid
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          toast({
            title: "E-shop přidán",
            description: `E-shop ${values.name} byl úspěšně přidán. API klíč: ${data.apiKey}`,
          });
          setOpen(false);
        } else {
          const errorData = await response.json();
          toast({
            variant: "destructive",
            title: "Chyba",
            description: `Nepodařilo se přidat e-shop: ${errorData.error}`,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Chyba",
          description: "Uživatel není přihlášen",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Chyba",
        description: `Nepodařilo se přidat e-shop: ${error.message}`,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Přidat E-shop</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Přidat nový E-shop</DialogTitle>
          <DialogDescription>
            Zadejte zde údaje o vašem novém e-shopu. Po dokončení klikněte na tlačítko uložit.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název E-shopu</FormLabel>
                  <FormControl>
                    <Input placeholder="Můj E-shop" {...field} />
                  </FormControl>
                  <FormDescription>
                    Toto je veřejný název vašeho e-shopu.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL E-shopu</FormLabel>
                  <FormControl>
                    <Input placeholder="https://mujeshop.cz" {...field} />
                  </FormControl>
                  <FormDescription>
                    Webová adresa vašeho e-shopu.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sektor produktů</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte sektor produktů" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="online_gambling">Online hazardní hry</SelectItem>
                      <SelectItem value="sexual_content">Obsah pro dospělé</SelectItem>
                      <SelectItem value="pyrotechnics">Pyrotechnika</SelectItem>
                      <SelectItem value="firearms">Zbraně</SelectItem>
                      <SelectItem value="tobacco">Tabákové výrobky</SelectItem>
                      <SelectItem value="alcohol">Alkohol</SelectItem>
                      <SelectItem value="adult_content">Pornografie</SelectItem>
                      <SelectItem value="chemicals">Chemikálie a nebezpečné látky</SelectItem>
                      <SelectItem value="other">Jiné</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Vyberte hlavní sektor produktů pro váš e-shop.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="integrationMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metoda integrace</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte metodu integrace" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="modal">Modální okno</SelectItem>
                      <SelectItem value="sdk">SDK nebo Plugin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Zvolte způsob, jakým chcete integrovat PassProve.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ smlouvy</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte typ smlouvy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="two_year">2-letá smlouva</SelectItem>
                      <SelectItem value="no_contract">Bez smlouvy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Zvolte preferovaný typ smlouvy.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Uložit E-shop</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}