//frontend/src/components/AppActions.jsx

'use client';

import { useRouter } from 'next/navigation';

export default function AppActions({ app, onAction, lang }) {
  const router = useRouter();

  // 🧠 Executa comando no backend ou delega para o dashboard
  const handleCommand = async (e, action) => {
    e.stopPropagation();

    // 🔐 Confirmações para ações críticas
    const confirmMessages = {
      stop: "Deseja realmente parar esta aplicação?",
      restart: "Deseja reiniciar esta aplicação?",
      delete: "Tem certeza que deseja excluir esta aplicação?",
      rebuild: "Deseja rebuildar esta aplicação?",
      backup: "Deseja gerar um backup desta aplicação?",
    };

    if (confirmMessages[action] && !confirm(confirmMessages[action])) return;

    // ✅ Se função externa foi passada, delega para ela
    if (typeof onAction === 'function') {
      return onAction(action, app);
    }

    const token = localStorage.getItem("token");
    const containerId = app.ContainerName || app.ID;
    console.log("🔧 Enviando ação:", action, "para", containerId);

    // ⏱️ Medição de tempo de execução
    const startTime = performance.now();

    const res = await fetch(`/api/app/${action}?id=${containerId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const data = await res.json();
    alert(`${data.message || "Ação executada."} ⏱️ (${duration}s)`);
  };

  return (
    <div className="flex w-full flex-col justify-between gap-2 sm:flex-row">
      <div className="flex w-full justify-start gap-2 rounded-md">
        {/* ▶️ Iniciar */}
        <button
          title="Iniciar"
          onClick={(e) => handleCommand(e, "start")}
          disabled={app.status === "running"}
          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
            <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
          </svg>
          Iniciar
        </button>

        {/* 🔁 Reiniciar */}
        <button
          title="Reiniciar"
          onClick={(e) => handleCommand(e, "restart")}
          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
            <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path>
          </svg>
          Reiniciar
        </button>

        {/* ⏸️ Parar */}
        <button
          title="Parar"
          onClick={(e) => handleCommand(e, "stop")}
          disabled={app.status !== "running"}
          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
            <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z"></path>
          </svg>
          Parar
        </button>
                {/* 🔧 Rebuildar */}
        <button
          title="Rebuildar"
          onClick={(e) => handleCommand(e, "rebuild")}
          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background text-black shadow-[0_0_0_1px] shadow-border hover:bg-virtus-500 focus-visible:ring-2 focus-visible:ring-yellow-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-white">
            <path d="M128,24a104,104,0,1,0,104,104A104.12,104.12,0,0,0,128,24Zm8,104V88a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8h32a8,8,0,0,0,0-16Z"></path>
          </svg>
          Rebuildar
        </button>

        {/* 📦 Backup */}
        <button
          title="Backup"
          onClick={(e) => handleCommand(e, "backup")}
          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background text-white shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-white">
            <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm40,104a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H96a8,8,0,0,1,0-16h24V88a8,8,0,0,1,16,0v32h24A8,8,0,0,1,168,128Z"></path>
          </svg>
          Backup
        </button>

        {/* 🗑️ Excluir */}
        <button
          title="Excluir"
          onClick={(e) => handleCommand(e, "delete")}
          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background text-white shadow-[0_0_0_1px] shadow-border hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
            <path d="M216,48H176V40a16,16,0,0,0-16-16H96A16,16,0,0,0,80,40v8H40A8,8,0,0,0,40,64H52.65l12.2,147.09A16,16,0,0,0,80.8,224h94.4a16,16,0,0,0,16-12.91L203.35,64H216a8,8,0,0,0,0-16ZM96,48h64v8H96ZM80.8,208l-12-144H187.2l-12,144Z"></path>
          </svg>
          Excluir
        </button>
      </div>

      {/* 📄 Mostrar registros */}
      <button
        title="Mostrar registros"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/${lang}/dashboard/app/${app.ID}`);
        }}
        className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
          <path d="M117.31,134l-72,64a8,8,0,1,1-10.63-12L100,128,34.69,70A8,8,0,1,1,45.32,58l72,64a8,8,0,0,1,0,12ZM216,184H120a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Z"></path>
        </svg>
        Mostrar registros
      </button>
    </div>
  );
}

//frontend/src/components/AppActions.jsx

//'use client';
//
//import { useRouter } from 'next/navigation';
//
//export default function AppActions({ app }) {
//  const router = useRouter();
//
//  // 🧠 Executa comando no backend
//  const handleCommand = async (e, action) => {
//    e.stopPropagation();
//
//    // 🔐 Confirmações para ações críticas
//    const confirmMessages = {
//      stop: "Deseja realmente parar esta aplicação?",
//      restart: "Deseja reiniciar esta aplicação?",
//      delete: "Tem certeza que deseja excluir esta aplicação?",
//      rebuild: "Deseja rebuildar esta aplicação?",
//      backup: "Deseja gerar um backup desta aplicação?",
//    };
//
//    if (confirmMessages[action] && !confirm(confirmMessages[action])) return;
//
//    const token = localStorage.getItem("token");
//
//    // ✅ Garante que o ID do container seja sempre válido
//    const containerId = app.ContainerName || app.ID;
//    console.log("🔧 Enviando ação:", action, "para", containerId);
//
//    // ⏱️ Medição de tempo de execução
//    const startTime = performance.now();
//
//    const res = await fetch(`/api/app/${action}?id=${containerId}`, {
//      method: "POST", // ✅ método correto para ações
//      headers: {
//        Authorization: `Bearer ${token}`,
//        "Content-Type": "application/json",
//      },
//      credentials: "include",
//    });
//
//    const endTime = performance.now();
//    const duration = ((endTime - startTime) / 1000).toFixed(2); // segundos
//
//    const data = await res.json();
//    alert(`${data.message || "Ação executada."} ⏱️ (${duration}s)`);
//  };
//
//  return (
//    <div className="flex w-full flex-col justify-between gap-2 sm:flex-row">
//      <div className="flex w-full justify-start gap-2 rounded-md">
//        {/* ▶️ Iniciar */}
//        <button
//          title="Iniciar"
//          onClick={(e) => handleCommand(e, "start")}
//          disabled={app.status === "running"}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
//            <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
//          </svg>
//          Iniciar
//        </button>
//
//        {/* 🔁 Reiniciar */}
//        <button
//          title="Reiniciar"
//          onClick={(e) => handleCommand(e, "restart")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
//            <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path>
//          </svg>
//          Reiniciar
//        </button>
//
//        {/* ⏸️ Parar */}
//        <button
//          title="Parar"
//          onClick={(e) => handleCommand(e, "stop")}
//          disabled={app.status !== "running"}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
//            <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z"></path>
//          </svg>
//          Parar
//        </button>
//                {/* 🔧 Rebuildar */}
//        <button
//          title="Rebuildar"
//          onClick={(e) => handleCommand(e, "rebuild")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-yellow-600 text-black shadow-[0_0_0_1px] shadow-border hover:bg-yellow-500 focus-visible:ring-2 focus-visible:ring-yellow-400"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-black">
//            <path d="M128,24a104,104,0,1,0,104,104A104.12,104.12,0,0,0,128,24Zm8,104V88a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8h32a8,8,0,0,0,0-16Z"></path>
//          </svg>
//          Rebuildar
//        </button>
//
//        {/* 📦 Backup */}
//        <button
//          title="Backup"
//          onClick={(e) => handleCommand(e, "backup")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-purple-700 text-white shadow-[0_0_0_1px] shadow-border hover:bg-purple-600 focus-visible:ring-2 focus-visible:ring-purple-500"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-white">
//            <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm40,104a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H96a8,8,0,0,1,0-16h24V88a8,8,0,0,1,16,0v32h24A8,8,0,0,1,168,128Z"></path>
//          </svg>
//          Backup
//        </button>
//
//        {/* 🗑️ Excluir */}
//        <button
//          title="Excluir"
//          onClick={(e) => handleCommand(e, "delete")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-red-900 text-white shadow-[0_0_0_1px] shadow-border hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M216,48H176V40a16,16,0,0,0-16-16H96A16,16,0,0,0,80,40v8H40A8,8,0,0,0,40,64H52.65l12.2,147.09A16,16,0,0,0,80.8,224h94.4a16,16,0,0,0,16-12.91L203.35,64H216a8,8,0,0,0,0-16ZM96,48h64v8H96ZM80.8,208l-12-144H187.2l-12,144Z"></path>
//          </svg>
//          Excluir
//        </button>
//      </div>
//
//      {/* 📄 Mostrar registros */}
//      <button
//        title="Mostrar registros"
//        onClick={(e) => {
//          e.stopPropagation();
//          router.push(`/dashboard/app/${app.ID}`);
//        }}
//        className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
//      >
//        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//          <path d="M117.31,134l-72,64a8,8,0,1,1-10.63-12L100,128,34.69,70A8,8,0,1,1,45.32,58l72,64a8,8,0,0,1,0,12ZM216,184H120a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Z"></path>
//        </svg>
//        Mostrar registros
//      </button>
//    </div>
//  );
//}

//'use client';
//
//import { useRouter } from 'next/navigation';
//
//export default function AppActions({ app }) {
//  const router = useRouter();
//
//  // 🧠 Executa comando no backend
//  const handleCommand = async (e, action) => {
//    e.stopPropagation();
//
//    // 🔐 Confirmações para ações críticas
//    const confirmMessages = {
//      stop: "Deseja realmente parar esta aplicação?",
//      restart: "Deseja reiniciar esta aplicação?",
//      delete: "Tem certeza que deseja excluir esta aplicação?",
//      rebuild: "Deseja rebuildar esta aplicação?",
//      backup: "Deseja gerar um backup desta aplicação?",
//    };
//
//    if (confirmMessages[action] && !confirm(confirmMessages[action])) return;
//
//    const token = localStorage.getItem("token");
//
//    // ✅ Garante que o ID do container seja sempre válido
//    const containerId = app.ContainerName || app.ID;
//    console.log("🔧 Enviando ação:", action, "para", containerId);
//
//    // ⏱️ Medição de tempo de execução
//    const startTime = performance.now();
//
//    const res = await fetch(`/api/app/${action}?id=${containerId}`, {
//      method: "POST", // ✅ método correto para ações
//      headers: {
//        Authorization: `Bearer ${token}`,
//        "Content-Type": "application/json",
//      },
//      credentials: "include",
//    });
//
//    const endTime = performance.now();
//    const duration = ((endTime - startTime) / 1000).toFixed(2); // segundos
//
//    const data = await res.json();
//    alert(`${data.message || "Ação executada."} ⏱️ (${duration}s)`);
//  };
//
//  return (
//    <div className="flex w-full flex-col justify-between gap-2 sm:flex-row">
//      <div className="flex w-full justify-start gap-2 rounded-md">
//        {/* ▶️ Iniciar */}
//        <button
//          title="Iniciar"
//          onClick={(e) => handleCommand(e, "start")}
//          disabled={app.status === "running"}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
//            <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
//          </svg>
//          Iniciar
//        </button>
//
//        {/* 🔁 Reiniciar */}
//        <button
//          title="Reiniciar"
//          onClick={(e) => handleCommand(e, "restart")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
//            <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path>
//          </svg>
//          Reiniciar
//        </button>
//
//        {/* ⏸️ Parar */}
//        <button
//          title="Parar"
//          onClick={(e) => handleCommand(e, "stop")}
//          disabled={app.status !== "running"}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
//            <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z"></path>
//          </svg>
//          Parar
//        </button>
//
//        {/* 🔧 Rebuildar */}
//        <button
//          title="Rebuildar"
//          onClick={(e) => handleCommand(e, "rebuild")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-yellow-600 text-black shadow-[0_0_0_1px] shadow-border hover:bg-yellow-500 focus-visible:ring-2 focus-visible:ring-yellow-400"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-black">
//            <path d="M128,24a104,104,0,1,0,104,104A104.12,104.12,0,0,0,128,24Zm8,104V88a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8h32a8,8,0,0,0,0-16Z"></path>
//          </svg>
//          Rebuildar
//        </button>
//
//        {/* 📦 Backup */}
//        <button
//          title="Backup"
//          onClick={(e) => handleCommand(e, "backup")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-purple-700 text-white shadow-[0_0_0_1px] shadow-border hover:bg-purple-600 focus-visible:ring-2 focus-visible:ring-purple-500"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-white">
//            <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm40,104a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H96a8,8,0,0,1,0-16h24V88a8,8,0,0,1,16,0v32h24A8,8,0,0,1,168,128Z"></path>
//          </svg>
//          Backup
//        </button>
//
//        {/* 🗑️ Excluir */}
//        <button
//          title="Excluir"
//          onClick={(e) => handleCommand(e, "delete")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-red-900 text-white shadow-[0_0_0_1px] shadow-border hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500"
//        >
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M216,48H176V40a16,16,0,0,0-16-16H96A16,16,0,0,0,80,40v8H40A8,8,0,0,0,40,64H52.65l12.2,147.09A16,16,0,0,0,80.8,224h94.4a16,16,0,0,0,16-12.91L203.35,64H216a8,8,0,0,0,0-16ZM96,48h64v8H96ZM80.8,208l-12-144H187.2l-12,144Z"></path>
//          </svg>
//          Excluir
//        </button>
//      </div>
//
//      {/* 📄 Mostrar registros */}
//      <button
//        title="Mostrar registros"
//        onClick={(e) => {
//          e.stopPropagation();
//          router.push(`/dashboard/app/${app.ID}`);
//        }}
//        className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
//      >
//        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//          <path d="M117.31,134l-72,64a8,8,0,1,1-10.63-12L100,128,34.69,70A8,8,0,1,1,45.32,58l72,64a8,8,0,0,1,0,12ZM216,184H120a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Z"></path>
//        </svg>
//        Mostrar registros
//      </button>
//    </div>
//  );
//}

//'use client';
//
//import { useRouter } from 'next/navigation';
//
//export default function AppActions({ app }) {
//  const router = useRouter();
//
//  // 🧠 Executa comando no backend
//  const handleCommand = async (e, action) => {
//    e.stopPropagation();
//
//    // 🔐 Confirmações para ações críticas
//    const confirmMessages = {
//      stop: "Deseja realmente parar esta aplicação?",
//      restart: "Deseja reiniciar esta aplicação?",
//      delete: "Tem certeza que deseja excluir esta aplicação?",
//    };
//
//    if (confirmMessages[action] && !confirm(confirmMessages[action])) return;
//
//    const token = localStorage.getItem("token");
//
//    // ✅ Garante que o ID do container seja sempre válido
//    const containerId = app.ContainerName || app.ID;
//    console.log("🔧 Enviando ação:", action, "para", containerId);
//
//    // ⏱️ Medição de tempo de execução
//    const startTime = performance.now();
//
//    const res = await fetch(`/api/app/${action}?id=${containerId}`, {
//      method: "POST", // ✅ método correto para ações
//      headers: {
//        Authorization: `Bearer ${token}`,
//        "Content-Type": "application/json",
//      },
//      credentials: "include",
//    });
//
//    const endTime = performance.now();
//    const duration = ((endTime - startTime) / 1000).toFixed(2); // segundos
//
//    const data = await res.json();
//    alert(`${data.message || "Ação executada."} ⏱️ (${duration}s)`);
//  };
//
//  return (
//    <div className="flex w-full flex-col justify-between gap-2 sm:flex-row">
//      <div className="flex w-full justify-start gap-2 rounded-md">
//        {/* ▶️ Iniciar */}
//        <button
//          title="Iniciar"
//          onClick={(e) => handleCommand(e, "start")}
//          disabled={app.status === "running"}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
//            <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
//          </svg>
//          Iniciar
//        </button>
//
//        {/* 🔁 Reiniciar */}
//        <button
//          title="Reiniciar"
//          onClick={(e) => handleCommand(e, "restart")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
//            <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path>
//          </svg>
//          Reiniciar
//        </button>
//
//        {/* ⏸️ Parar */}
//        <button
//          title="Parar"
//          onClick={(e) => handleCommand(e, "stop")}
//          disabled={app.status !== "running"}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
//            <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z"></path>
//          </svg>
//          Parar
//        </button>
//
//        {/* 🗑️ Excluir */}
//        <button
//          title="Excluir"
//          onClick={(e) => handleCommand(e, "delete")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-red-900 text-white shadow-[0_0_0_1px] shadow-border hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M216,48H176V40a16,16,0,0,0-16-16H96A16,16,0,0,0,80,40v8H40A8,8,0,0,0,40,64H52.65l12.2,147.09A16,16,0,0,0,80.8,224h94.4a16,16,0,0,0,16-12.91L203.35,64H216a8,8,0,0,0,0-16ZM96,48h64v8H96ZM80.8,208l-12-144H187.2l-12,144Z"></path>
//          </svg>
//          Excluir
//        </button>
//      </div>
//
//      {/* 📄 Mostrar registros */}
//      <button
//        title="Mostrar registros"
//        onClick={(e) => {
//          e.stopPropagation();
//          router.push(`/dashboard/app/${app.ID}`);
//        }}
//        className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
//      >
//        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//          <path d="M117.31,134l-72,64a8,8,0,1,1-10.63-12L100,128,34.69,70A8,8,0,1,1,45.32,58l72,64a8,8,0,0,1,0,12ZM216,184H120a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Z"></path>
//        </svg>
//        Mostrar registros
//      </button>
//    </div>
//  );
//}

//'use client';
//
//import { useRouter } from 'next/navigation';
//
//export default function AppActions({ app }) {
//  const router = useRouter();
//
//  // 🧠 Executa comando no backend
//  const handleCommand = async (e, action) => {
//    e.stopPropagation();
//
//    // 🔐 Confirmações para ações críticas
//    const confirmMessages = {
//      stop: "Deseja realmente parar esta aplicação?",
//      restart: "Deseja reiniciar esta aplicação?",
//      delete: "Tem certeza que deseja excluir esta aplicação?",
//    };
//
//    if (confirmMessages[action] && !confirm(confirmMessages[action])) return;
//
//    const token = localStorage.getItem("token");
//
//    // ⏱️ Medição de tempo de execução
//    const startTime = performance.now();
//
//    const res = await fetch(`/api/app/${action}?id=${app.ContainerName}`, {
//      method: "POST", // ✅ método correto para ações
//      headers: {
//        Authorization: `Bearer ${token}`,
//        "Content-Type": "application/json",
//      },
//      credentials: "include",
//    });
//
//    const endTime = performance.now();
//    const duration = ((endTime - startTime) / 1000).toFixed(2); // segundos
//
//    const data = await res.json();
//    alert(`${data.message || "Ação executada."} ⏱️ (${duration}s)`);
//  };
//
//  return (
//    <div className="flex w-full flex-col justify-between gap-2 sm:flex-row">
//      <div className="flex w-full justify-start gap-2 rounded-md">
//        {/* ▶️ Iniciar */}
//        <button
//          title="Iniciar"
//          onClick={(e) => handleCommand(e, "start")}
//          disabled={app.status === "running"}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
//            <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
//          </svg>
//          Iniciar
//        </button>
//
//        {/* 🔁 Reiniciar */}
//        <button
//          title="Reiniciar"
//          onClick={(e) => handleCommand(e, "restart")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
//            <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path>
//          </svg>
//          Reiniciar
//        </button>
//
//        {/* ⏸️ Parar */}
//        <button
//          title="Parar"
//          onClick={(e) => handleCommand(e, "stop")}
//          disabled={app.status !== "running"}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
//            <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z"></path>
//          </svg>
//          Parar
//        </button>
//
//        {/* 🗑️ Excluir */}
//        <button
//          title="Excluir"
//          onClick={(e) => handleCommand(e, "delete")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-red-900 text-white shadow-[0_0_0_1px] shadow-border hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M216,48H176V40a16,16,0,0,0-16-16H96A16,16,0,0,0,80,40v8H40A8,8,0,0,0,40,64H52.65l12.2,147.09A16,16,0,0,0,80.8,224h94.4a16,16,0,0,0,16-12.91L203.35,64H216a8,8,0,0,0,0-16ZM96,48h64v8H96ZM80.8,208l-12-144H187.2l-12,144Z"></path>
//          </svg>
//          Excluir
//        </button>
//      </div>
//
//      {/* 📄 Mostrar registros */}
//      <button
//        title="Mostrar registros"
//        onClick={(e) => {
//          e.stopPropagation();
//          router.push(`/dashboard/app/${app.ID}`);
//        }}
//        className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
//      >
//        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//          <path d="M117.31,134l-72,64a8,8,0,1,1-10.63-12L100,128,34.69,70A8,8,0,1,1,45.32,58l72,64a8,8,0,0,1,0,12ZM216,184H120a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Z"></path>
//        </svg>
//        Mostrar registros
//      </button>
//    </div>
//  );
//}

//frontend/src/components/AppActions.jsx

//'use client';
//
//import { useRouter } from 'next/navigation';
//
//export default function AppActions({ app }) {
//  const router = useRouter();
//
//  // 🧠 Executa comando no backend
//  const handleCommand = async (e, action) => {
//    e.stopPropagation();
//
//    // 🔐 Confirmações para ações críticas
//    const confirmMessages = {
//      stop: "Deseja realmente parar esta aplicação?",
//      restart: "Deseja reiniciar esta aplicação?",
//      delete: "Tem certeza que deseja excluir esta aplicação?",
//    };
//
//    if (confirmMessages[action] && !confirm(confirmMessages[action])) return;
//
//    const token = localStorage.getItem("token");
//
//    // ⏱️ Medição de tempo de execução
//    const startTime = performance.now();
//
//    const res = await fetch(`/api/app/${action}?id=${app.ContainerName}`, {
//      method: "POST", // ✅ método correto para ações
//      headers: {
//        Authorization: `Bearer ${token}`,
//        "Content-Type": "application/json",
//      },
//      credentials: "include",
//    });
//
//    const endTime = performance.now();
//    const duration = ((endTime - startTime) / 1000).toFixed(2); // segundos
//
//    const data = await res.json();
//    alert(`${data.message || "Ação executada."} ⏱️ (${duration}s)`);
//  };
//
//  return (
//    <div className="flex w-full flex-col justify-between gap-2 sm:flex-row">
//      <div className="flex w-full justify-start gap-2 rounded-md">
//        {/* ▶️ Iniciar */}
//        <button
//          title="Iniciar"
//          onClick={(e) => handleCommand(e, "start")}
//          disabled={app.status === "running"}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
//            <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
//          </svg>
//          Iniciar
//        </button>
//
//        {/* 🔁 Reiniciar */}
//        <button
//          title="Reiniciar"
//          onClick={(e) => handleCommand(e, "restart")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
//            <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path>
//          </svg>
//          Reiniciar
//        </button>
//
//        {/* ⏸️ Parar */}
//        <button
//          title="Parar"
//          onClick={(e) => handleCommand(e, "stop")}
//          disabled={app.status !== "running"}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
//            <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z"></path>
//          </svg>
//          Parar
//        </button>
//      </div>
//
//      {/* 📄 Mostrar registros */}
//      <button
//        title="Mostrar registros"
//        onClick={(e) => {
//          e.stopPropagation();
//          router.push(`/dashboard/app/${app.ID}`);
//        }}
//        className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
//      >
//        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//          <path d="M117.31,134l-72,64a8,8,0,1,1-10.63-12L100,128,34.69,70A8,8,0,1,1,45.32,58l72,64a8,8,0,0,1,0,12ZM216,184H120a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Z"></path>
//        </svg>
//        Mostrar registros
//      </button>
//    </div>
//  );
//}

//frontend/src/components/AppActions.jsx

//'use client';
//
//import { useRouter } from 'next/navigation';
//
//export default function AppActions({ app }) {
//  const router = useRouter();
//
//  const handleCommand = async (e, action) => {
//    e.stopPropagation();
//
//    const confirmMessages = {
//      stop: "Deseja realmente parar esta aplicação?",
//      restart: "Deseja reiniciar esta aplicação?",
//      delete: "Tem certeza que deseja excluir esta aplicação?",
//    };
//
//    if (confirmMessages[action] && !confirm(confirmMessages[action])) return;
//
//    const token = localStorage.getItem("token");
//
//    const res = await fetch(`/api/app/${action}?id=${app.ContainerName}`, {
//      method: "POST",
//      headers: {
//        Authorization: `Bearer ${token}`,
//        "Content-Type": "application/json",
//      },
//      credentials: "include",
//    });
//
//    const data = await res.json();
//    alert(data.message || "Ação executada.");
//  };
//
//  return (
//    <div className="flex w-full flex-col justify-between gap-2 sm:flex-row">
//      <div className="flex w-full justify-start gap-2 rounded-md">
//        <button
//          title="Iniciar"
//          onClick={(e) => handleCommand(e, "start")}
//          disabled={app.status === "running"}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
//            <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
//          </svg>
//          Iniciar
//        </button>
//
//        <button
//          title="Reiniciar"
//          onClick={(e) => handleCommand(e, "restart")}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
//            <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path>
//          </svg>
//          Reiniciar
//        </button>
//
//        <button
//          title="Parar"
//          onClick={(e) => handleCommand(e, "stop")}
//          disabled={app.status !== "running"}
//          className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
//            <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z"></path>
//          </svg>
//          Parar
//        </button>
//      </div>
//
//      <button
//        title="Mostrar registros"
//        onClick={(e) => {
//          e.stopPropagation();
//          router.push(`/dashboard/app/${app.ID}`);
//        }}
//        className="group/button relative inline-flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-normal bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-blue-700"
//      >
//        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//          <path d="M117.31,134l-72,64a8,8,0,1,1-10.63-12L100,128,34.69,70A8,8,0,1,1,45.32,58l72,64a8,8,0,0,1,0,12ZM216,184H120a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Z"></path>
//        </svg>
//        Mostrar registros
//      </button>
//    </div>
//  );
//}