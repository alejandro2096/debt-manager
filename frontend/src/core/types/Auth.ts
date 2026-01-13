export type LoginDTO = {
  email: string
  password: string
}

export type RegisterDTO = {
  name: string
  email: string
  password: string
}

export type AuthUser = {
  id: string
  email: string
  name: string
}


export type AuthResult = Record<string, unknown>
