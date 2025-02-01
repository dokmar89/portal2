'use client'

    import {useToast } from '@/hooks/use-toast' 
    import { useState, useEffect } from "react"
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
    import { Textarea } from "@/components/ui/textarea"
    import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
    } from "@/components/ui/select"
    import { Checkbox } from "@/components/ui/checkbox"
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
    import { Preview } from "@/components/preview"
    import { db } from "@/lib/firebase";
    import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
    import { useAuth } from "@/contexts/AuthContext";


    const customizationFormSchema = z.object({
      eshop: z.string({
        required_error: "Vyberte prosím e-shop.",
      }),
      nazev: z.string().min(2, {
        message: "Název musí mít alespoň 2 znaky.",
      }),
      logo: z.string().url({
        message: "Zadejte prosím platnou URL adresu pro logo.",
      }),
      primarniBarva: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: "Zadejte prosím platný hexadecimální kód barvy.",
      }),
      sekundarniBarva: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: "Zadejte prosím platný hexadecimální kód barvy.",
      }),
      font: z.enum(["sans", "serif", "mono"]),
      tvarTlacitka: z.enum(["zaoblene", "hranate", "pill"]),
      uvitaciText: z.string().min(10, {
        message: "Uvítací text musí mít alespoň 10 znaků.",
      }),
      textUspesnehoOvereni: z.string().min(10, {
        message: "Text úspěšného ověření musí mít alespoň 10 znaků.",
      }),
      textZamitnuti: z.string().min(10, {
        message: "Text zamítnutí musí mít alespoň 10 znaků.",
      }),
      textSelhani: z.string().min(10, {
        message: "Text selhání musí mít alespoň 10 znaků.",
      }),
      metody: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "Musíte vybrat alespoň jednu metodu ověření.",
      }),
      vlastniUrlPresmerovani: z.string().url().optional(),
      emailovaUpozorneni: z.boolean().default(false),
      emailProUpozorneni: z.string().email().optional(),
    })

    type CustomizationFormValues = z.infer<typeof customizationFormSchema>

    const defaultValues: Partial<CustomizationFormValues> = {
        eshop: "",
        nazev: "",
        logo: "",
        primarniBarva: "#000000",
        sekundarniBarva: "#ffffff",
        font: "sans",
        tvarTlacitka: "zaoblene",
        uvitaciText: "Vítejte v procesu ověření věku.",
        textUspesnehoOvereni: "Ověření bylo úspěšné. Můžete pokračovat.",
        textZamitnuti: "Je nám líto, ale nesplňujete věkový požadavek.",
        textSelhani: "Ověření selhalo. Zkuste to prosím znovu.",
        metody: ["OCR"],
        vlastniUrlPresmerovani: "",
        emailovaUpozorneni: false,
        emailProUpozorneni: "",
    }

    export function CustomizationForm() {
        const [eshops, setEshops] = useState<any[]>([]);
        const { user } = useAuth();
      const { toast } = useToast();

      const form = useForm<CustomizationFormValues>({
        resolver: zodResolver(customizationFormSchema),
        defaultValues,
      })

        useEffect(() => {
            const fetchEshops = async () => {
                if (user?.uid) {
                    const q = query(collection(db, "eshops"), where("companyId", "==", user.uid));
                    const querySnapshot = await getDocs(q);
                    const fetchedEshops = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setEshops(fetchedEshops);
                }
            };
            fetchEshops();
        }, [user]);

      async function onSubmit(data: CustomizationFormValues) {
          try {
              if(data.eshop) {
                  const token = await user.getIdToken();
                    const response = await fetch('/api/updateEshopCustomization', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ data: { eshopId: data.eshop, customization: {
                            nazev: data.nazev,
                            logo: data.logo,
                            primarniBarva: data.primarniBarva,
                            sekundarniBarva: data.sekundarniBarva,
                            font: data.font,
                            tvarTlacitka: data.tvarTlacitka,
                            uvitaciText: data.uvitaciText,
                            textUspesnehoOvereni: data.textUspesnehoOvereni,
                            textZamitnuti: data.textZamitnuti,
                            textSelhani: data.textSelhani,
                            metody: data.metody,
                            vlastniUrlPresmerovani: data.vlastniUrlPresmerovani,
                            emailovaUpozorneni: data.emailovaUpozorneni,
                            emailProUpozorneni: data.emailProUpozorneni,
                        } } })
                    });
                    if (response.ok) {
                         toast({
                             title: "Nastavení uložena",
                             description: "Nastavení přizpůsobení pro e-shop byla uložena.",
                         });
                    } else {
                        const errorData = await response.json();
                        toast({
                            variant: "destructive",
                            title: "Chyba",
                            description: `Nepodařilo se uložit nastavení: ${errorData.error}`,
                        });
                    }
              } else {
                  toast({
                      variant: "destructive",
                      title: "Chyba",
                      description: "Vyberte prosím e-shop",
                  });
              }
          } catch (error: any) {
              toast({
                  variant: "destructive",
                  title: "Chyba",
                  description: `Nepodařilo se uložit nastavení: ${error.message}`,
              });
          }
      }

      const [showPreview, setShowPreview] = useState(false)

      const handlePreview = () => {
        setShowPreview(true)
      }

      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Výběr E-shopu</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="eshop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vyberte E-shop</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte e-shop" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eshops.map((eshop) => (
                            <SelectItem key={eshop.id} value={eshop.id}>
                              {eshop.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nazev"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Název E-shopu</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL loga</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="primarniBarva"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primární barva</FormLabel>
                      <FormControl>
                        <Input {...field} type="color" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sekundarniBarva"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sekundární barva</FormLabel>
                      <FormControl>
                        <Input {...field} type="color" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Font a styl</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="font"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Font</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte font" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sans">Sans-serif</SelectItem>
                          <SelectItem value="serif">Serif</SelectItem>
                          <SelectItem value="mono">Monospace</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tvarTlacitka"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tvar tlačítka</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte tvar tlačítka" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="zaoblene">Zaoblené</SelectItem>
                          <SelectItem value="hranate">Hranaté</SelectItem>
                          <SelectItem value="pill">Pill</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Texty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="uvitaciText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uvítací text</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="textUspesnehoOvereni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text úspěšného ověření</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="textZamitnuti"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text zamítnutí</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="textSelhani"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text selhání</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metody ověření</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="metody"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Dostupné metody</FormLabel>
                        <FormDescription>
                          Vyberte metody ověření, které chcete nabízet.
                        </FormDescription>
                      </div>
                      {["OCR", "BankID", "MojeID", "FaceScan"].map((method) => (
                        <FormField
                          key={method}
                          control={form.control}
                          name="metody"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={method}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(method)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, method])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== method
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {method}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Další nastavení</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="vlastniUrlPresmerovani"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vlastní URL pro přesměrování při zamítnutí</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailovaUpozorneni"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Povolit e-mailová upozornění
                        </FormLabel>
                        <FormDescription>
                          Dostávejte e-mailová upozornění na události ověření.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                {form.watch("emailovaUpozorneni") && (
                  <FormField
                    control={form.control}
                    name="emailProUpozorneni"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail pro upozornění</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <Button type="button" onClick={handlePreview} className="mr-2">
              Náhled
            </Button>
            <Button type="submit">Uložit přizpůsobení</Button>
            {showPreview && (
              <Preview
                customization={form.getValues()}
                onClose={() => setShowPreview(false)}
              />
            )}
          </form>
        </Form>
      )
    }