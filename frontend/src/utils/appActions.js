//frontend/src/utils/appActions.js

export async function handleAction(type, app) {
  const id = app.name || app.ID || app.ContainerName;
  if (!id) return;

  try {
    await fetch(`/api/app/${type}?id=${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  } catch (err) {
    // Erros são ignorados silenciosamente
  }
}

//export async function handleAction(type, app) {
//  const id = app.name || app.ID || app.ContainerName;
//  if (!id) {
//    alert(`🚫 Erro: aplicação sem identificador válido`);
//    return;
//  }
//
//  try {
//    const res = await fetch(`/api/app/${type}?id=${id}`, {
//      method: "POST",
//      headers: { "Content-Type": "application/json" },
//      credentials: "include",
//    });
//
//    const result = await res.json();
//    if (res.ok) {
//      alert(`✅ ${result.message || "Ação realizada com sucesso."}`);
//    } else {
//      alert(`❌ ${result.error || "Falha na ação."}`);
//    }
//  } catch (err) {
//    alert(`🚫 Erro: ${err.message}`);
//  }
//}