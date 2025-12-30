export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "E-mail é obrigatório." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('http://localhost:8080/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
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
    console.error("Erro no envio de código (signin):", error);
    return new Response(JSON.stringify({ error: "Erro interno no servidor." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}