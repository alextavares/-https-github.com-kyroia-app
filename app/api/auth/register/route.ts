import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from 'zod'

const RegisterSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Formato de e-mail inválido'),
  password: z.string().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, 
    'A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial'
  ),
})

export async function POST(request: NextRequest) {
  console.log("=== REGISTER API CALLED ===")
  
  try {
    const body = await request.json()
    console.log("Request body:", { ...body, password: "[HIDDEN]" })
    
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.errors?.[0]?.message || 'Dados inválidos'
      return NextResponse.json({ message: msg }, { status: 400 })
    }
    const { name, email, password } = parsed.data

    // Verificar se usuário já existe
    console.log("Checking if user exists with email:", email)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    console.log("Existing user check result:", existingUser ? "User exists" : "User not found")

    if (existingUser) {
      // Normalizar tempo para mitigar enumeração por tempo (hash dummy)
      await bcrypt.hash(password, 10)
      return NextResponse.json(
        { message: "E-mail já cadastrado" },
        { status: 400 }
      )
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      }
    })

    // Retornar dados do usuário (sem senha)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _ignored, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: "Usuário registrado com sucesso", user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error("=== REGISTER ERROR ===")
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Full error:", error)
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("P2002")) {
        return NextResponse.json(
          { message: "Email já está em uso" },
          { status: 400 }
        )
      }
      if (error.message.includes("connect") || error.message.includes("timed out")) {
        return NextResponse.json(
          { message: "Erro de conexão com o banco de dados. Por favor, tente novamente." },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { message: "Erro ao registrar usuário" },
      { status: 500 }
    )
  }
}
