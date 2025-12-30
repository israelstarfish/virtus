// 📄 frontend/src/app/api/verify-code/signup/route.js

export async function POST(request) {
  try {
    const { email, username } = await request.json();

    if (!email || !username) {
      return new Response(JSON.stringify({ error: "E-mail e nome de usuário são obrigatórios." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('http://localhost:8080/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username }),
    });

    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch {
      return new Response(JSON.stringify({ error: "Resposta inválida do servidor." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Erro no envio de código (signup):", error);
    return new Response(JSON.stringify({ error: "Erro interno no servidor." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

//export async function POST(request) {
//  const { email, code, username } = await request.json();
//
//  // ⚠️ Validação básica
//  if (!email || !code || !username) {
//    return new Response(JSON.stringify({ error: 'Email, código e username são obrigatórios' }), { status: 400 });
//  }
//
//  // 🔗 Validação real com backend Go
//  const response = await fetch('http://localhost:8080/api/verify', {
//    method: 'POST',
//    headers: { 'Content-Type': 'application/json' },
//    credentials: 'include', // ✅ importante para aceitar o cookie do backend
//    body: JSON.stringify({ email, code, username }),
//  });
//
//  // 📥 Tenta extrair JSON da resposta
//  try {
//    const result = await response.json();
//
//    if (!response.ok || !result.success) {
//      return new Response(JSON.stringify({ error: result.error || 'Código inválido' }), { status: 401 });
//    }
//
//    // ✅ Autenticação bem-sucedida — token já foi definido pelo backend
//    return new Response(JSON.stringify({ success: true }), { status: response.status || 500 });
//  } catch (err) {
//    console.error('Erro ao processar resposta do backend:', err);
//    return new Response(JSON.stringify({ error: 'Erro interno ao validar código' }), { status: 500 });
//  }
//}
