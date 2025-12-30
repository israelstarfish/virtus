// 📄 frontend/src/app/api/session-code/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura';

export async function GET(req) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token ausente ou inválido' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ message: 'Token válido', user: decoded });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token expirado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}