
import {useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Jak funguje PassProve?",
    answer: "PassProve využívá pokročilé metody ověření věku, jako jsou BankID, MojeID, OCR a FaceScan, k ověření věku vašich zákazníků. Když se zákazník pokusí přistoupit k obsahu s věkovým omezením nebo provést nákup, je vyzván k ověření svého věku pomocí jedné z těchto metod."
  },
  {
    question: "Je PassProve v souladu s předpisy o ochraně osobních údajů?",
    answer: "Ano, PassProve je plně v souladu s GDPR a dalšími relevantními předpisy o ochraně osobních údajů. Ochranu soukromí bereme velmi vážně a implementujeme přísná opatření k ochraně uživatelských informací."
  },
  {
    question: "Jak mohu integrovat PassProve do svého e-shopu?",
    answer: "PassProve nabízí několik možností integrace včetně API, Modálního okna a SDK/Pluginu. Můžete si vybrat metodu, která nejlépe vyhovuje platformě a požadavkům vašeho e-shopu. Podrobné návody k integraci jsou k dispozici v naší dokumentaci."
  },
  {
    question: "Co mám dělat, když ověření selže?",
    answer: "Pokud ověření selže, zákazníkovi se zobrazí zpráva o selhání. Tuto zprávu můžete přizpůsobit v sekci Přizpůsobení. Doporučujeme poskytnout jasné instrukce o tom, co by měl zákazník dělat dále, například zkusit jinou metodu ověření nebo kontaktovat podporu."
  },
  {
    question: "Jak se počítají náklady na ověření?",
    answer: "Náklady na ověření se odečítají z vašeho zůstatku v peněžence. Cena za ověření se liší v závislosti na použité metodě. Historii transakcí a aktuální sazby můžete zobrazit v sekci Peněženka ve vašem dashboardu."
  }
]

export function FAQSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Často kladené otázky</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

