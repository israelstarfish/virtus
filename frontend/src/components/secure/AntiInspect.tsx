//frontend/src/components/secure/AntiInspect.tsx

'use client';
import { useEffect, useState } from 'react';

export default function AntiInspect(): React.ReactElement | null {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let contextBlocked = false;

    const handleContextMenu = (e: MouseEvent) => {
      if (contextBlocked) return;
      e.preventDefault();
      setMenuVisible(true);
      setMenuPosition({ x: e.clientX, y: e.clientY });
      contextBlocked = true;
      setTimeout(() => {
        contextBlocked = false;
      }, 300);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInsideMenu = target.closest('[role="menu"]');
      if (!isInsideMenu) {
        setMenuVisible(false);
      }
    };
    
    //const handleClick = () => setMenuVisible(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && ['C', 'V', 'U'].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && ['I', 'J'].includes(e.key))
      ) {
        e.preventDefault();
        console.warn('Ação bloqueada');
      }
      if (e.key === 'Escape') {
        setMenuVisible(false);
      }
    };

    const detectDevTools = () => {
      if (
        window.outerHeight - window.innerHeight > 100 ||
        window.outerWidth - window.innerWidth > 100
      ) {
        console.warn('DevTools detectado');
      }
    };

    const blockInput = (e: InputEvent) => {
      if ((e as any).inputType === 'insertFromPaste') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('beforeinput', blockInput);
    const interval = setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('beforeinput', blockInput);
      clearInterval(interval);
    };
  }, []);

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'back':
        window.history.back();
        break;
      case 'reload':
        window.location.reload();
        break;
      case 'fullscreen':
        document.documentElement.requestFullscreen?.();
        break;
      case 'exitFullscreen':
        document.exitFullscreen?.();
        break;
      case 'bookmark':
        alert('Pressione Ctrl+D para adicionar aos favoritos');
        break;
    }
    setMenuVisible(false);
  };

  return (
    <>
      {menuVisible && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300 animate-in fade-in zoom-in"
          style={{ top: menuPosition.y, left: menuPosition.x }}
        >
          <ul className="space-y-2 text-sm">
            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('back')}>🔙 Voltar</li>
            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('reload')}>🔄 Recarregar</li>
            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('bookmark')}>⭐ Adicionar aos Favoritos</li>
            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('fullscreen')}>🖥️ Tela Cheia</li>
            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('exitFullscreen')}>❌ Sair da Tela Cheia</li>
          </ul>
        </div>
      )}
    </>
  );
}

//frontend/src/components/secure/AntiInspect.tsx

//'use client';
//import { useEffect, useState } from 'react';
//
//export default function AntiInspect(): React.ReactElement | null {
//  const [menuVisible, setMenuVisible] = useState(false);
//  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
//
//  useEffect(() => {
//    let contextBlocked = false;
//
//    const handleContextMenu = (e: MouseEvent) => {
//      if (contextBlocked) return;
//      e.preventDefault();
//      setMenuVisible(true);
//      setMenuPosition({ x: e.clientX, y: e.clientY });
//      contextBlocked = true;
//      setTimeout(() => {
//        contextBlocked = false;
//      }, 300);
//    };
//
//    const handleClick = () => setMenuVisible(false);
//
//    const handleKeyDown = (e: KeyboardEvent) => {
//      if (
//        e.key === 'F12' ||
//        (e.ctrlKey && ['C', 'V', 'U'].includes(e.key)) ||
//        (e.ctrlKey && e.shiftKey && ['I', 'J'].includes(e.key))
//      ) {
//        e.preventDefault();
//        console.warn('Ação bloqueada');
//      }
//      if (e.key === 'Escape') {
//        setMenuVisible(false);
//      }
//    };
//
//    const detectDevTools = () => {
//      if (
//        window.outerHeight - window.innerHeight > 100 ||
//        window.outerWidth - window.innerWidth > 100
//      ) {
//        console.warn('DevTools detectado');
//      }
//    };
//
//    const blockInput = (e: InputEvent) => {
//      if ((e as any).inputType === 'insertFromPaste') {
//        e.preventDefault();
//      }
//    };
//
//    document.addEventListener('contextmenu', handleContextMenu);
//    document.addEventListener('click', handleClick);
//    document.addEventListener('keydown', handleKeyDown);
//    document.addEventListener('beforeinput', blockInput);
//    const interval = setInterval(detectDevTools, 1000);
//
//    return () => {
//      document.removeEventListener('contextmenu', handleContextMenu);
//      document.removeEventListener('click', handleClick);
//      document.removeEventListener('keydown', handleKeyDown);
//      document.removeEventListener('beforeinput', blockInput);
//      clearInterval(interval);
//    };
//  }, []);
//
//  const handleMenuAction = (action: string) => {
//    switch (action) {
//      case 'back':
//        window.history.back();
//        break;
//      case 'reload':
//        window.location.reload();
//        break;
//      case 'fullscreen':
//        document.documentElement.requestFullscreen?.();
//        break;
//      case 'exitFullscreen':
//        document.exitFullscreen?.();
//        break;
//      case 'bookmark':
//        alert('Pressione Ctrl+D para adicionar aos favoritos');
//        break;
//    }
//    setMenuVisible(false);
//  };
//
//  return (
//    <>
//      {menuVisible && (
//        <div
//          role="menu"
//          aria-orientation="vertical"
//          className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300 animate-in fade-in zoom-in"
//          style={{ top: menuPosition.y, left: menuPosition.x }}
//        >
//          <ul className="space-y-2 text-sm">
//            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('back')}>🔙 Voltar</li>
//            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('reload')}>🔄 Recarregar</li>
//            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('bookmark')}>⭐ Adicionar aos Favoritos</li>
//            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('fullscreen')}>🖥️ Tela Cheia</li>
//            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('exitFullscreen')}>❌ Sair da Tela Cheia</li>
//          </ul>
//        </div>
//      )}
//    </>
//  );
//}

//'use client';
//import { useEffect, useState } from 'react';
//
//export default function AntiInspect(): React.ReactElement | null {
//  const [menuVisible, setMenuVisible] = useState(false);
//  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
//
//  useEffect(() => {
//    let contextBlocked = false;
//
//    const handleContextMenu = (e: MouseEvent) => {
//      if (contextBlocked) return;
//      e.preventDefault();
//      setMenuVisible(true);
//      setMenuPosition({ x: e.clientX, y: e.clientY });
//      contextBlocked = true;
//      setTimeout(() => {
//        contextBlocked = false;
//      }, 300);
//    };
//
//    const handleClick = () => setMenuVisible(false);
//
//    const handleKeyDown = (e: KeyboardEvent) => {
//      if (
//        e.key === 'F12' ||
//        (e.ctrlKey && ['C', 'V', 'U'].includes(e.key)) ||
//        (e.ctrlKey && e.shiftKey && ['I', 'J'].includes(e.key))
//      ) {
//        e.preventDefault();
//        window.location.reload();
//      }
//      if (e.key === 'Escape') {
//        setMenuVisible(false);
//      }
//    };
//
//    const detectDevTools = () => {
//      if (
//        window.outerHeight - window.innerHeight > 100 ||
//        window.outerWidth - window.innerWidth > 100
//      ) {
//        window.location.reload();
//      }
//    };
//
//    document.addEventListener('contextmenu', handleContextMenu);
//    document.addEventListener('click', handleClick);
//    document.addEventListener('keydown', handleKeyDown);
//    const interval = setInterval(detectDevTools, 1000);
//
//    return () => {
//      document.removeEventListener('contextmenu', handleContextMenu);
//      document.removeEventListener('click', handleClick);
//      document.removeEventListener('keydown', handleKeyDown);
//      clearInterval(interval);
//    };
//  }, []);
//
//  const handleMenuAction = (action: string) => {
//    switch (action) {
//      case 'back':
//        window.history.back();
//        break;
//      case 'reload':
//        window.location.reload();
//        break;
//      case 'fullscreen':
//        document.documentElement.requestFullscreen?.();
//        break;
//      case 'exitFullscreen':
//        document.exitFullscreen?.();
//        break;
//      case 'bookmark':
//        alert('Pressione Ctrl+D para adicionar aos favoritos');
//        break;
//    }
//    setMenuVisible(false);
//  };
//
//  return (
//    <>
//      {menuVisible && (
//        <div
//          role="menu"
//          aria-orientation="vertical"
//          className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300 animate-in fade-in zoom-in"
//          style={{ top: menuPosition.y, left: menuPosition.x }}
//        >
//          <ul className="space-y-2 text-sm">
//            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('back')}>🔙 Voltar</li>
//            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('reload')}>🔄 Recarregar</li>
//            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('bookmark')}>⭐ Adicionar aos Favoritos</li>
//            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('fullscreen')}>🖥️ Tela Cheia</li>
//            <li role="menuitem" tabIndex={0} className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('exitFullscreen')}>❌ Sair da Tela Cheia</li>
//          </ul>
//        </div>
//      )}
//    </>
//  );
//}

//frontend/src/components/secure/AntiInspect.tsx

//'use client';
//import { useEffect, useState } from 'react';
//
//export default function AntiInspect(): React.ReactElement | null {
//  const [menuVisible, setMenuVisible] = useState(false);
//  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
//
//  useEffect(() => {
//    const handleContextMenu = (e: MouseEvent) => {
//      e.preventDefault();
//      setMenuVisible(true);
//      setMenuPosition({ x: e.clientX, y: e.clientY });
//    };
//
//    const handleClick = () => setMenuVisible(false);
//
//    const handleKeyDown = (e: KeyboardEvent) => {
//      if (
//        e.key === 'F12' ||
//        (e.ctrlKey && e.key === 'C') ||
//        (e.ctrlKey && e.key === 'V') ||
//        (e.ctrlKey && e.key === 'U') ||
//        (e.ctrlKey && e.shiftKey && ['I', 'J'].includes(e.key))
//      ) {
//        e.preventDefault();
//        window.location.reload();
//      }
//    };
//
//    document.addEventListener('contextmenu', handleContextMenu);
//    document.addEventListener('click', handleClick);
//    document.addEventListener('keydown', handleKeyDown);
//
//    return () => {
//      document.removeEventListener('contextmenu', handleContextMenu);
//      document.removeEventListener('click', handleClick);
//      document.removeEventListener('keydown', handleKeyDown);
//    };
//  }, []);
//
//  const handleMenuAction = (action: string) => {
//    switch (action) {
//      case 'back':
//        window.history.back();
//        break;
//      case 'reload':
//        window.location.reload();
//        break;
//      case 'fullscreen':
//        document.documentElement.requestFullscreen?.();
//        break;
//      case 'exitFullscreen':
//        document.exitFullscreen?.();
//        break;
//      case 'bookmark':
//        alert('Pressione Ctrl+D para adicionar aos favoritos');
//        break;
//    }
//    setMenuVisible(false);
//  };
//
//  return (
//    <>
//      {menuVisible && (
//        <div
//          role="menu"
//          aria-orientation="vertical"
//          className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300 animate-in fade-in zoom-in"
//          style={{ top: menuPosition.y, left: menuPosition.x }}
//        >
//          <ul className="space-y-2 text-sm">
//            <li className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('back')}>🔙 Voltar</li>
//            <li className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('reload')}>🔄 Recarregar</li>
//            <li className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('bookmark')}>⭐ Adicionar aos Favoritos</li>
//            <li className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('fullscreen')}>🖥️ Tela Cheia</li>
//            <li className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('exitFullscreen')}>❌ Sair da Tela Cheia</li>
//          </ul>
//        </div>
//      )}
//    </>
//  );
//}

//frontend/src/components/secure/AntiInspect.tsx

//'use client';
//import { useEffect, useState } from 'react';
//
//export default function AntiInspect(): React.ReactElement | null {
//  const [menuVisible, setMenuVisible] = useState(false);
//  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
//
//  useEffect(() => {
//    const handleContextMenu = (e: MouseEvent) => {
//      e.preventDefault();
//      setMenuVisible(true);
//      setMenuPosition({ x: e.clientX, y: e.clientY });
//    };
//
//    const handleClick = () => setMenuVisible(false);
//
//    const handleKeyDown = (e: KeyboardEvent) => {
//      if (
//        e.key === 'F12' ||
//        (e.ctrlKey && e.key === 'C') ||
//        (e.ctrlKey && e.key === 'V') ||
//        (e.ctrlKey && e.key === 'U') ||
//        (e.ctrlKey && e.shiftKey && ['I', 'J'].includes(e.key))
//      ) {
//        e.preventDefault();
//        window.location.reload();
//      }
//    };
//
//    document.addEventListener('contextmenu', handleContextMenu);
//    document.addEventListener('click', handleClick);
//    document.addEventListener('keydown', handleKeyDown);
//
//    return () => {
//      document.removeEventListener('contextmenu', handleContextMenu);
//      document.removeEventListener('click', handleClick);
//      document.removeEventListener('keydown', handleKeyDown);
//    };
//  }, []);
//
//  const handleMenuAction = (action: string) => {
//    switch (action) {
//      case 'back':
//        window.history.back();
//        break;
//      case 'reload':
//        window.location.reload();
//        break;
//      case 'fullscreen':
//        document.documentElement.requestFullscreen?.();
//        break;
//      case 'exitFullscreen':
//        document.exitFullscreen?.();
//        break;
//      case 'bookmark':
//        alert('Pressione Ctrl+D para adicionar aos favoritos');
//        break;
//    }
//    setMenuVisible(false);
//  };
//
//  return (
//    <>
//      {menuVisible && (
//        <div
//          style={{
//            position: 'fixed',
//            top: menuPosition.y,
//            left: menuPosition.x,
//            background: '#111',
//            color: '#fff',
//            borderRadius: '6px',
//            padding: '8px',
//            zIndex: 9999,
//            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
//          }}
//        >
//          <ul className="space-y-2 text-sm">
//            <li className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('back')}>🔙 Voltar</li>
//            <li className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('reload')}>🔄 Recarregar</li>
//            <li className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('bookmark')}>⭐ Adicionar aos Favoritos</li>
//            <li className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('fullscreen')}>🖥️ Tela Cheia</li>
//            <li className="cursor-pointer hover:text-blue-400" onClick={() => handleMenuAction('exitFullscreen')}>❌ Sair da Tela Cheia</li>
//          </ul>
//        </div>
//      )}
//    </>
//  );
//}

//'use client';
//import { useEffect } from 'react';
//
//export default function AntiInspect(): null {
//  useEffect(() => {
//    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
//    const handleKeyDown = (e: KeyboardEvent) => {
//      if (
//        e.key === 'F12' ||
//        (e.ctrlKey && e.key === 'C') ||
//        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
//        (e.ctrlKey && e.key === 'U') ||
//        (e.ctrlKey && e.shiftKey && e.key === 'J')
//      ) {
//        e.preventDefault();
//        window.location.reload();
//      }
//    };
//
//    document.addEventListener('contextmenu', handleContextMenu);
//    document.addEventListener('keydown', handleKeyDown);
//
//    return () => {
//      document.removeEventListener('contextmenu', handleContextMenu);
//      document.removeEventListener('keydown', handleKeyDown);
//    };
//  }, []);
//
//  return null;
//}