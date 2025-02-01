import Image from "next/image"
import Link from "next/link"

import { LoginForm } from "@/components/login-form"
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog"

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            src="/placeholder.svg?height=40&width=40"
            alt="Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          PassProve
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;PassProve změnil způsob, jakým spravujeme naše e-commerce ověření. Je intuitivní, výkonný a bezpečný.&rdquo;
            </p>
            <footer className="text-sm">Jana Nováková</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Vítejte v PassProve
            </h1>
            <p className="text-sm text-muted-foreground">
              Zadejte svůj e-mail pro přihlášení do účtu
            </p>
          </div>
          <LoginForm />
          <ForgotPasswordDialog />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              Nemáte účet? Zaregistrujte se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

