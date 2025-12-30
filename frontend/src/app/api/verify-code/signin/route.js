// 📄 frontend/src/app/api/verify-code/signin/route.js

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'E-mail inválido' }), { status: 400 });
    }

    // 🔗 Envia para backend Go
    const response = await fetch('http://localhost:8080/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    // 🧠 Verifica se resposta é JSON antes de tentar parsear
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Resposta inesperada do backend:', text);
      return new Response(JSON.stringify({ error: 'Resposta inválida do servidor' }), { status: 500 });
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), { status: response.status || 500 });
  } catch (error) {
    console.error('Erro no login:', error);
    return new Response(JSON.stringify({ error: 'Erro interno no servidor' }), { status: 500 });
  }
}
// 📄 frontend/src/app/api/verify-code/signin/route.js
//
//export async function POST(request) {
//  try {
//    const { email, code } = await request.json();
//
//    // ⚠️ Validação básica
//    if (!email || !code) {
//      return new Response(
//        JSON.stringify({ error: 'Email e código são obrigatórios' }),
//        { status: 400 }
//      );
//    }
//
//    // 🔗 Envia para backend Go para validar o código de login
//    const response = await fetch('http://localhost:8080/api/verify', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      credentials: 'include', // ✅ importante para aceitar o cookie do backend
//      body: JSON.stringify({ email, code }),
//    });
//
//    // 📥 Tenta extrair JSON da resposta
//    const contentType = response.headers.get('content-type');
//    if (!contentType || !contentType.includes('application/json')) {
//      const text = await response.text();
//      console.error('Resposta inesperada do backend:', text);
//      return new Response(
//        JSON.stringify({ error: 'Resposta inválida do servidor' }),
//        { status: 500 }
//      );
//    }
//
//    const result = await response.json();
//
//    if (!response.ok || !result.success) {
//      return new Response(
//        JSON.stringify({ error: result.error || 'Código inválido' }),
//        { status: 401 }
//      );
//    }
//
//    // ✅ Autenticação bem-sucedida — token já foi definido pelo backend
//    return new Response(JSON.stringify({ success: true }), {
//      status: response.status || 200,
//    });
//  } catch (error) {
//    console.error('Erro ao verificar código de login:', error);
//    return new Response(
//      JSON.stringify({ error: 'Erro interno no servidor' }),
//      { status: 500 }
//    );
//  }
//}