"use client"

import { useState } from "react"
import {useToast } from '@/hooks/use-toast'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
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
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const accountFormSchema = z.object({
  jmeno: z.string().min(2, {
    message: "Jméno musí mít alespoň 2 znaky.",
  }),
  prijmeni: z.string().min(2, {
    message: "Příjmení musí mít alespoň 2 znaky.",
  }),
  telefon: z.string().min(9, {
    message: "Telefonní číslo musí mít alespoň 9 znaků.",
  }),
  email: z.string().email({
    message: "Zadejte prosím platnou e-mailovou adresu.",
  }),
  nazevSpolecnosti: z.string().min(2, {
    message: "Název společnosti musí mít alespoň 2 znaky.",
  }),
  ico: z.string().min(8, {
    message: "IČO musí mít alespoň 8 znaků.",
  }),
  adresa: z.string().min(5, {
    message: "Adresa musí mít alespoň 5 znaků.",
  }),
  weboveStranky: z.string().url({
    message: "Zadejte prosím platnou URL adresu.",
  }),
  dvoufaktoroveOvereni: z.boolean().default(false).optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>


export function AccountForm() {
    const { user } = useAuth();
    const [initialValues, setInitialValues] = useState<Partial<AccountFormValues>>({});
    const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: initialValues,
  });
    const { toast } = useToast();

    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.uid) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setInitialValues({
                        jmeno: userData.firstName,
                        prijmeni: userData.lastName,
                        telefon: userData.phone,
                        email: userData.email,
                        nazevSpolecnosti: userData.companyName,
                        ico: userData.ico,
                        adresa: userData.address,
                        weboveStranky: userData.website,
                        dvoufaktoroveOvereni: userData.dvoufaktoroveOvereni
                    });
                     form.reset(userData);
                }
            }
        };
        fetchUserData();
    }, [user, form]);

  async function onSubmit(data: AccountFormValues) {
      try {
          if (user?.uid) {
              const token = await user.getIdToken();
              const response = await fetch('/api/updateUserProfile', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ data: {
                      uid: user.uid,
                      firstName: data.jmeno,
                      lastName: data.prijmeni,
                      phone: data.telefon,
                      website: data.weboveStranky,
                      dvoufaktoroveOvereni: data.dvoufaktoroveOvereni
                  } })
              });
              if (response.ok) {
                  toast({
                      title: "Profil aktualizován",
                      description: "Váš profil byl úspěšně aktualizován.",
                  });
              } else {
                  const errorData = await response.json();
                  toast({
                      variant: "destructive",
                      title: "Chyba",
                      description: `Nepodařilo se aktualizovat profil: ${errorData.error}`,
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
              description: `Nepodařilo se aktualizovat profil: ${error.message}`,
          });
      }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Osobní informace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="jmeno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jméno</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prijmeni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Příjmení</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input {...field}  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informace o společnosti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="nazevSpolecnosti"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název společnosti</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IČO</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresa</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weboveStranky"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webové stránky</FormLabel>
                  <FormControl>
                    <Input {...field}  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zabezpečení</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="dvoufaktoroveOvereni"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Dvoufaktorové ověření</FormLabel>
                    <FormDescription>
                      Povolte dvoufaktorové ověření pro zvýšení bezpečnosti.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="button" variant="outline">Změnit heslo</Button>
          </CardContent>
        </Card>

        <Button type="submit">Uložit změny</Button>
      </form>
    </Form>
  )
}