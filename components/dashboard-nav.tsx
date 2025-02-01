"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, CreditCard, Settings, ShoppingBag, Users, HelpCircle, Download } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export function DashboardNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "Nástěnka",
      href: "/dashboard",
      icon: <BarChart className="mr-2 h-4 w-4" />,
    },
    {
      title: "E-shopy",
      href: "/dashboard/eshops",
      icon: <ShoppingBag className="mr-2 h-4 w-4" />,
    },
    {
      title: "Účet",
      href: "/dashboard/account",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Přizpůsobení",
      href: "/dashboard/customization",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
    {
      title: "Peněženka",
      href: "/dashboard/wallet",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      title: "Podpora",
      href: "/dashboard/support",
      icon: <HelpCircle className="mr-2 h-4 w-4" />,
    },
    {
      title: "Instalace",
      href: "/dashboard/installation",
      icon: <Download className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <nav className="flex flex-col space-y-2 p-4">
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
        >
          <Button
            variant={pathname === item.href ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            {item.icon}
            <span className="ml-2">{item.title}</span>
          </Button>
        </Link>
      ))}
    </nav>
  )
}