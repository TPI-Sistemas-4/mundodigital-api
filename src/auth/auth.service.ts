import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.usuario.findUnique({ where: { email } })
    if (!user) throw new UnauthorizedException('Credenciales inválidas')

    const ok = await bcrypt.compare(password, user.passwordhash)
    if (!ok) throw new UnauthorizedException('Credenciales inválidas')

    const token = this.jwt.sign({ sub: user.idusuario, email: user.email, rol: user.tipousuario })
    return { token, rol: user.tipousuario }
  }
}