import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import {useToast } from '@/hooks/use-toast'

interface PreviewProps {
  customization: {
    tvarTlacitka: "zaoblene" | "hranate" | "pill"
    font: "sans" | "serif" | "mono"
    primarniBarva: string
    sekundarniBarva: string
    nazev: string
    uvitaciText: string
    metody: string[]
    textUspesnehoOvereni: string
    textZamitnuti: string
    textSelhani: string
  }
  onClose: () => void
}

export function Preview({ customization, onClose }: PreviewProps) {
  const buttonStyle = {
    borderRadius: 
      customization.tvarTlacitka === "zaoblene" ? "0.375rem" : 
      customization.tvarTlacitka === "hranate" ? "0" : "9999px",
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verification Module Preview</DialogTitle>
          <DialogDescription>
            This is how your verification module will look based on your customization.
          </DialogDescription>
        </DialogHeader>
        <div 
          style={{
            fontFamily: customization.font === "sans" ? "sans-serif" : 
                        customization.font === "serif" ? "serif" : "monospace",
            color: customization.primarniBarva,
            backgroundColor: customization.sekundarniBarva,
            padding: "1rem",
            borderRadius: "0.5rem",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>{customization.nazev}</h2>
          <p style={{ marginBottom: "1rem" }}>{customization.uvitaciText}</p>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {customization.metody.map((method, index) => (
              <Button key={index} style={buttonStyle}>
                {method}
              </Button>
            ))}
          </div>
          <p style={{ fontSize: "0.875rem" }}>
            Passed: {customization.textUspesnehoOvereni}
          </p>
          <p style={{ fontSize: "0.875rem" }}>
            Denied: {customization.textZamitnuti}
          </p>
          <p style={{ fontSize: "0.875rem" }}>
            Failed: {customization.textSelhani}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}