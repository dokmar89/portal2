"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, getDocs, Timestamp, orderBy, where } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";


interface Ticket {
    id: string;
    subject: string;
    status: "open" | "in_progress" | "resolved";
    priority: "low" | "medium" | "high";
    createdAt: any;
    customer: string;
    companyId: string;
}

export function SupportTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [newTicket, setNewTicket] = useState({ subject: "", description: "" });
    const { toast } = useToast();
    const { user } = useAuth();


    useEffect(() => {
        const fetchTickets = async () => {
            if(user?.uid) {
                try {
                    const token = await user.getIdToken();
                    const response = await fetch('/api/getSupportTickets', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ data: { companyId: user.uid } })
                    });
                    if (response.ok) {
                       const data = await response.json();
                        setTickets(data.data);
                    } else {
                        const errorData = await response.json();
                        toast({
                            variant: "destructive",
                            title: "Chyba",
                            description: `Nepodařilo se načíst tickety: ${errorData.error}`,
                        });
                    }
                } catch (error: any) {
                    toast({
                        variant: "destructive",
                        title: "Chyba",
                        description: `Nepodařilo se načíst tickety: ${error.message}`,
                    });
                }
            }
        };
        fetchTickets();
    }, [user]);

  const handleNewTicket = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Chyba",
        description: "Uživatel není přihlášen",
      });
      return;
    }
      try {
          const token = await user.getIdToken();
          const response = await fetch('/api/createSupportTicket', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ data: {
                  subject: newTicket.subject,
                  description: newTicket.description,
                  companyId: user.uid,
                  customer: user.email
              }})
          });
          if (response.ok) {
              toast({
                  title: "Ticket vytvořen",
                  description: "Váš ticket byl úspěšně vytvořen.",
              });
              setNewTicket({ subject: "", description: "" });
          } else {
              const errorData = await response.json();
              toast({
                  variant: "destructive",
                  title: "Chyba",
                  description: `Nepodařilo se vytvořit ticket: ${errorData.error}`,
              });
          }
      } catch (error: any) {
          toast({
              variant: "destructive",
              title: "Chyba",
              description: `Nepodařilo se vytvořit ticket: ${error.message}`,
          });
      }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickety podpory</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-4">Vytvořit nový tiket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vytvořit nový tiket podpory</DialogTitle>
              <DialogDescription>
                Popište svůj problém a my se vám ozveme co nejdříve.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="subject"
                  className="col-span-4"
                  placeholder="Předmět"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Textarea
                  id="description"
                  className="col-span-4"
                  placeholder="Popište svůj problém"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleNewTicket}>Odeslat tiket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID tiketu</TableHead>
              <TableHead>Předmět</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead>Priorita</TableHead>
              <TableHead>Vytvořeno</TableHead>
              <TableHead>Zákazník</TableHead>
              <TableHead>Společnost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.id}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticket.status === "open"
                        ? "bg-red-100 text-red-800"
                        : ticket.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticket.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : ticket.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </TableCell>
                <TableCell>{ticket.createdAt?.toDate().toLocaleString()}</TableCell>
                <TableCell>{ticket.customer}</TableCell>
                <TableCell>{ticket.companyId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}