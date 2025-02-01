"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { db } from "@/lib/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";

const registrationSchema = z.object({
  companyName: z.string().min(2, "Název společnosti musí mít alespoň 2 znaky."),
  ico: z.string().min(8, "IČO musí mít alespoň 8 znaků."),
  dic: z.string().min(8, "DIČ musí mít alespoň 8 znaků."),
  street: z.string().min(2, "Ulice musí mít alespoň 2 znaky."),
  postalCode: z.string().min(5, "PSČ musí mít alespoň 5 znaků."),
  city: z.string().min(2, "Město musí mít alespoň 2 znaky."),
  firstName: z.string().min(2, "Jméno musí mít alespoň 2 znaky."),
  lastName: z.string().min(2, "Příjmení musí mít alespoň 2 znaky."),
  phone: z.string().min(9, "Telefonní číslo musí mít alespoň 9 znaků."),
  email: z.string().email("Neplatná e-mailová adresa."),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Musíte souhlasit s podmínkami.",
  }),
})

type RegistrationFormValues = z.infer<typeof registrationSchema>

export function RegistrationForm() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      companyName: "",
      ico: "",
      dic: "",
      street: "",
      postalCode: "",
      city: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      acceptTerms: false,
    },
  })

  const onSubmit = async (data: RegistrationFormValues) => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      try {
        await addDoc(collection(db, "registrationRequests"), {
          companyName: data.companyName,
          ico: data.ico,
          dic: data.dic,
          address: `${data.street}, ${data.postalCode} ${data.city}`,
          contactPerson: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            phone: data.phone,
          },
          status: "pending",
          submittedAt: Timestamp.now(),
        });
        toast({
          title: "Registrace odeslána",
          description: "Vaše žádost o registraci byla odeslána. Brzy vás budeme kontaktovat.",
        });
        router.push("/login")
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Chyba registrace",
          description: "Došlo k chybě při odesílání registrace. Zkuste to prosím znovu.",
        });
      }
    }
  }

  const handleNext = async () => {
    const isValid = await form.trigger(
      step === 1
        ? ["companyName", "ico", "dic", "street", "postalCode", "city"]
        : ["firstName", "lastName", "phone", "email"]
    )
    if (isValid) {
      setStep(step + 1)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {step === 1 && (
          <>
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název společnosti</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DIČ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ulice</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PSČ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Město</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {step === 2 && (
          <>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jméno</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Příjmení</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {step === 3 && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Shrnutí</h3>
              <p>Společnost: {form.getValues("companyName")}</p>
              <p>IČO: {form.getValues("ico")}</p>
              <p>DIČ: {form.getValues("dic")}</p>
              <p>Adresa: {form.getValues("street")}, {form.getValues("postalCode")} {form.getValues("city")}</p>
              <p>Kontakt: {form.getValues("firstName")} {form.getValues("lastName")}</p>
              <p>Telefon: {form.getValues("phone")}</p>
              <p>E-mail: {form.getValues("email")}</p>
            </div>
            <FormField
              control={form.control}
              name="acceptTerms"
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
                      Souhlasím s podmínkami
                    </FormLabel>
                    <FormDescription>
                      Souhlasíte s našimi Podmínkami použití a Zásadami ochrany osobních údajů.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </>
        )}
        <div className="flex justify-between">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              Předchozí
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" onClick={handleNext}>
              Další
            </Button>
          ) : (
            <Button type="submit">
              Dokončit registraci
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}