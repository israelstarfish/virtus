//frontend/src/components/OTPInput.jsx

'use client';

import { useEffect, useRef, useState } from 'react';

export default function OTPInput({
  length = 8,
  onComplete,
  error = false,
  initialValue = '',
}) {
  const [code, setCode] = useState(Array(length).fill(''));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const confirmTimeout = useRef(null);

  // Preenche valor inicial se existir
  useEffect(() => {
    if (initialValue) {
      const chars = initialValue.slice(0, length).split('');
      setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
    }
  }, [initialValue, length]);

  // Chama onComplete quando todos os blocos estiverem preenchidos
  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === length && !code.includes('')) {
      if (confirmTimeout.current) clearTimeout(confirmTimeout.current);

      confirmTimeout.current = setTimeout(() => {
        onComplete?.(fullCode);
      }, 300); // ⏳ espera 300ms antes de disparar
    }

    return () => {
      if (confirmTimeout.current) clearTimeout(confirmTimeout.current);
    };
  }, [code, length, onComplete]);

  // Manipula colagem
  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').slice(0, length).split('');
    const updated = Array(length).fill('');
    pasted.forEach((char, i) => {
      updated[i] = char.toUpperCase();
    });
    setCode(updated);
  }

  // Manipula digitação
  function handleChange(e) {
    const chars = e.target.value.toUpperCase().slice(0, length).split('');
    setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
  }

  // Detecta foco/desfoco do input
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    // ✅ Aguarda o componente montar completamente antes de focar
    const focusTimeout = setTimeout(() => {
      input.focus();
    }, 50); // ⏳ pequeno delay para garantir renderização

    function handleFocus() {
      setIsFocused(true);
    }

    function handleBlur() {
      setIsFocused(false);
    }

    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);

    return () => {
      clearTimeout(focusTimeout);
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
    };
  }, []);

  const activeIndex = code.findIndex(c => c === '');
  const isFilled = activeIndex === -1;

  return (
    <div
      data-input-otp-container="true"
      className="relative flex items-center gap-2 cursor-text select-none"
      style={{ '--root-height': '40px' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Blocos visuais */}
      {code.map((char, index) => {
        const isActive = index === activeIndex || (isFilled && index === length - 1);
        return (
          <div
            key={index}
            className={`relative flex h-10 w-10 items-center justify-center text-sm font-mono font-bold transition-colors duration-200 ease-out
              bg-gray-800 text-white first:rounded-l-md last:rounded-r-md
              ${error
                ? 'border border-red-500'
                : isActive && isFocused
                  ? 'z-10 ring-1 ring-blue-500/50 border border-border-tertiary'
                  : 'border border-border-tertiary'}
            `}
          >
            {char}
            {isActive && isFocused && (
              <span className="absolute inset-0 flex items-center justify-center animate-caret-blink text-blue-400">
                |
              </span>
            )}
          </div>
        );
      })}

      {/* Input invisível */}
      <input
        autoComplete="one-time-code"
        inputMode="text"
        pattern="^[a-zA-Z0-9]+$"
        maxLength={length}
        value={code.join('')}
        onChange={handleChange}
        onPaste={handlePaste}
        ref={inputRef}
        name="code"
        className="absolute inset-0 w-[calc(100%+40px)] h-full text-left opacity-0 caret-transparent bg-transparent border-none outline-none font-mono tracking-[0.5em]"
        style={{
          color: 'transparent',
          pointerEvents: 'all',
          fontSize: 'var(--root-height)',
          fontVariantNumeric: 'tabular-nums',
          clipPath: 'inset(0px 40px 0px 0px)',
        }}
      />
    </div>
  );
}

//frontend/src/components/OTPInput.jsx

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//
//export default function OTPInput({
//  length = 8,
//  onComplete,
//  error = false,
//  initialValue = '',
//}) {
//  const [code, setCode] = useState(Array(length).fill(''));
//  const [isFocused, setIsFocused] = useState(false);
//  const inputRef = useRef(null);
//
//  // Preenche valor inicial se existir
//  useEffect(() => {
//    if (initialValue) {
//      const chars = initialValue.slice(0, length).split('');
//      setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//    }
//  }, [initialValue, length]);
//
//  // Chama onComplete quando todos os blocos estiverem preenchidos
//  useEffect(() => {
//    const fullCode = code.join('');
//    if (fullCode.length === length && !code.includes('')) {
//      onComplete?.(fullCode);
//    }
//  }, [code, length, onComplete]);
//
//  // Manipula colagem
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, length).split('');
//    const updated = Array(length).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char.toUpperCase();
//    });
//    setCode(updated);
//  }
//
//  // Manipula digitação
//  function handleChange(e) {
//    const chars = e.target.value.toUpperCase().slice(0, length).split('');
//    setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//  }
//
//  // Detecta foco/desfoco do input
//  useEffect(() => {
//    const input = inputRef.current;
//    if (!input) return;
//
//    function handleFocus() {
//      setIsFocused(true);
//    }
//
//    function handleBlur() {
//      setIsFocused(false);
//    }
//
//    input.addEventListener('focus', handleFocus);
//    input.addEventListener('blur', handleBlur);
//
//    return () => {
//      input.removeEventListener('focus', handleFocus);
//      input.removeEventListener('blur', handleBlur);
//    };
//  }, []);
//
//  const activeIndex = code.findIndex(c => c === '');
//  const isFilled = activeIndex === -1;
//
//  return (
//    <div
//      data-input-otp-container="true"
//      className="relative flex items-center gap-2 cursor-text select-none"
//      style={{ '--root-height': '40px' }}
//      onClick={() => inputRef.current?.focus()}
//    >
//      {/* Blocos visuais */}
//      {code.map((char, index) => {
//        const isActive = index === activeIndex || (isFilled && index === length - 1);
//        return (
//          <div
//            key={index}
//            className={`relative flex h-10 w-10 items-center justify-center text-sm font-mono font-bold transition-colors duration-200 ease-out
//              bg-gray-800 text-white first:rounded-l-md last:rounded-r-md
//              ${error
//                ? 'border border-red-500'
//                : isActive && isFocused
//                ? 'z-10 ring-1 ring-blue-500/50 border border-border-tertiary'
//                : 'border border-border-tertiary'}
//            `}
//          >
//            {char}
//            {isActive && isFocused && (
//              <span className="absolute inset-0 flex items-center justify-center animate-caret-blink text-blue-400">
//                |
//              </span>
//            )}
//          </div>
//        );
//      })}
//
//      {/* Input invisível */}
//      <input
//        autoComplete="one-time-code"
//        inputMode="text"
//        pattern="^[a-zA-Z0-9]+$"
//        maxLength={length}
//        value={code.join('')}
//        onChange={handleChange}
//        onPaste={handlePaste}
//        ref={inputRef}
//        name="code"
//        className="absolute inset-0 w-[calc(100%+40px)] h-full text-left opacity-0 caret-transparent bg-transparent border-none outline-none font-mono tracking-[0.5em]"
//        style={{
//          color: 'transparent',
//          pointerEvents: 'all',
//          fontSize: 'var(--root-height)',
//          fontVariantNumeric: 'tabular-nums',
//          clipPath: 'inset(0px 40px 0px 0px)',
//        }}
//      />
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//
//export default function OTPInput({
//  length = 8,
//  onComplete,
//  error = false,
//  initialValue = '',
//}) {
//  const [code, setCode] = useState(Array(length).fill(''));
//  const [isFocused, setIsFocused] = useState(false);
//  const inputRef = useRef(null);
//
//  // Preenche valor inicial se existir
//  useEffect(() => {
//    if (initialValue) {
//      const chars = initialValue.slice(0, length).split('');
//      setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//    }
//  }, [initialValue, length]);
//
//  // Chama onComplete quando todos os blocos estiverem preenchidos
//  useEffect(() => {
//    const fullCode = code.join('');
//    if (fullCode.length === length && !code.includes('')) {
//      onComplete?.(fullCode);
//    }
//  }, [code, length, onComplete]);
//
//  // Manipula colagem
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, length).split('');
//    const updated = Array(length).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char.toUpperCase();
//    });
//    setCode(updated);
//  }
//
//  // Manipula digitação
//  function handleChange(e) {
//    const chars = e.target.value.toUpperCase().slice(0, length).split('');
//    setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//  }
//
//  // Detecta foco/desfoco do input
//  useEffect(() => {
//    const input = inputRef.current;
//    if (!input) return;
//
//    function handleFocus() {
//      setIsFocused(true);
//    }
//
//    function handleBlur() {
//      setIsFocused(false);
//    }
//
//    input.addEventListener('focus', handleFocus);
//    input.addEventListener('blur', handleBlur);
//
//    return () => {
//      input.removeEventListener('focus', handleFocus);
//      input.removeEventListener('blur', handleBlur);
//    };
//  }, []);
//
//  const activeIndex = code.findIndex(c => c === '');
//  const isFilled = activeIndex === -1;
//
//  return (
//    <div
//      data-input-otp-container="true"
//      className="relative flex items-center gap-2 cursor-text select-none"
//      style={{ '--root-height': '40px' }}
//      onClick={() => inputRef.current?.focus()}
//    >
//      {/* Blocos visuais */}
//      {code.map((char, index) => {
//        const isActive = index === activeIndex || (isFilled && index === length - 1);
//        return (
//          <div
//            key={index}
//            className={`relative flex h-10 w-10 items-center justify-center text-sm font-mono font-bold transition-all
//              bg-gray-800 text-white first:rounded-l-md last:rounded-r-md
//              ${error
//                ? 'border border-red-500'
//                : isActive && isFocused
//                  ? 'z-10 ring-1 ring-blue-500/50 border border-border-tertiary'
//                  : 'border border-border-tertiary'}
//            `}
//          >
//            {char}
//            {isActive && isFocused && (
//              <span className="absolute inset-0 flex items-center justify-center animate-caret-blink text-blue-400">
//                |
//              </span>
//            )}
//          </div>
//        );
//      })}
//
//      {/* Input invisível */}
//      <input
//        autoComplete="one-time-code"
//        inputMode="text"
//        pattern="^[a-zA-Z0-9]+$"
//        maxLength={length}
//        value={code.join('')}
//        onChange={handleChange}
//        onPaste={handlePaste}
//        ref={inputRef}
//        name="code"
//        className="absolute inset-0 w-[calc(100%+40px)] h-full text-left opacity-0 caret-transparent bg-transparent border-none outline-none font-mono tracking-[0.5em]"
//        style={{
//          color: 'transparent',
//          pointerEvents: 'all',
//          fontSize: 'var(--root-height)',
//          fontVariantNumeric: 'tabular-nums',
//          clipPath: 'inset(0px 40px 0px 0px)',
//        }}
//      />
//    </div>
//  );
//}

//frontend/src/components/OTPInput.jsx

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//
//export default function OTPInput({
//  length = 8,
//  onComplete,
//  error = false,
//  initialValue = '',
//}) {
//  const [code, setCode] = useState(Array(length).fill(''));
//  const [isFocused, setIsFocused] = useState(false);
//  const inputRef = useRef(null);
//
//  // Preenche valor inicial se existir
//  useEffect(() => {
//    if (initialValue) {
//      const chars = initialValue.slice(0, length).split('');
//      setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//    }
//  }, [initialValue, length]);
//
//  // Chama onComplete quando todos os blocos estiverem preenchidos
//  useEffect(() => {
//    const fullCode = code.join('');
//    if (fullCode.length === length && !code.includes('')) {
//      onComplete?.(fullCode);
//    }
//  }, [code, length, onComplete]);
//
//  // Manipula colagem
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, length).split('');
//    const updated = Array(length).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char.toUpperCase();
//    });
//    setCode(updated);
//  }
//
//  // Manipula digitação
//  function handleChange(e) {
//    const chars = e.target.value.slice(0, length).split('');
//    setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//  }
//
//  // Detecta foco/desfoco do input
//  useEffect(() => {
//    const input = inputRef.current;
//    if (!input) return;
//
//    function handleFocus() {
//      setIsFocused(true);
//    }
//
//    function handleBlur() {
//      setIsFocused(false);
//    }
//
//    input.addEventListener('focus', handleFocus);
//    input.addEventListener('blur', handleBlur);
//
//    return () => {
//      input.removeEventListener('focus', handleFocus);
//      input.removeEventListener('blur', handleBlur);
//    };
//  }, []);
//
//  const activeIndex = code.findIndex(c => c === '');
//  const isFilled = activeIndex === -1;
//
//  return (
//    <div
//      data-input-otp-container="true"
//      className="relative flex items-center gap-2 cursor-text select-none"
//      style={{ '--root-height': '40px' }}
//      onClick={() => inputRef.current?.focus()}
//    >
//      {/* Blocos visuais */}
//      {code.map((char, index) => {
//        const isActive = index === activeIndex || (isFilled && index === length - 1);
//        return (
//          <div
//            key={index}
//            className={`relative flex h-10 w-10 items-center justify-center text-sm font-mono font-bold transition-all
//              bg-gray-800 text-white first:rounded-l-md last:rounded-r-md
//              ${error
//                ? 'border border-red-500'
//                : isActive && isFocused
//                ? 'z-10 ring-1 ring-blue-500/50 border border-border-tertiary'
//                : 'border border-border-tertiary'}
//            `}
//          >
//            {char}
//            {isActive && isFocused && (
//              <span className="absolute inset-0 flex items-center justify-center animate-caret-blink text-blue-400">
//                |
//              </span>
//            )}
//          </div>
//        );
//      })}
//
//      {/* Input invisível */}
//      <input
//        autoComplete="one-time-code"
//        inputMode="text"
//        pattern="^[a-zA-Z0-9]+$"
//        maxLength={length}
//        value={code.join('')}
//        onChange={handleChange}
//        onPaste={handlePaste}
//        ref={inputRef}
//        name="code"
//        className="absolute inset-0 w-[calc(100%+40px)] h-full text-left opacity-0 caret-transparent bg-transparent border-none outline-none font-mono tracking-[0.5em]"
//        style={{
//          color: 'transparent',
//          pointerEvents: 'all',
//          fontSize: 'var(--root-height)',
//          fontVariantNumeric: 'tabular-nums',
//          clipPath: 'inset(0px 40px 0px 0px)',
//        }}
//      />
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//
//export default function OTPInput({
//  length = 8,
//  onComplete,
//  error = false,
//  initialValue = '',
//}) {
//  const [code, setCode] = useState(Array(length).fill(''));
//  const inputRef = useRef(null);
//
//  // Preenche valor inicial se existir
//  useEffect(() => {
//    if (initialValue) {
//      const chars = initialValue.slice(0, length).split('');
//      setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//    }
//  }, [initialValue, length]);
//
//  // Chama onComplete quando todos os blocos estiverem preenchidos
//  useEffect(() => {
//    const fullCode = code.join('');
//    if (fullCode.length === length && !code.includes('')) {
//      onComplete?.(fullCode);
//    }
//  }, [code, length, onComplete]);
//
//  // Manipula colagem
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, length).split('');
//    const updated = Array(length).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char.toUpperCase();
//    });
//    setCode(updated);
//  }
//
//  // Manipula digitação
//  function handleChange(e) {
//    const chars = e.target.value.slice(0, length).split('');
//    setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//  }
//
//  const activeIndex = code.findIndex(c => c === '');
//  const isFilled = activeIndex === -1;
//
//  return (
//    <div
//      data-input-otp-container="true"
//      className="relative flex items-center gap-2 cursor-text select-none"
//      style={{ '--root-height': '40px' }}
//      onClick={() => inputRef.current?.focus()}
//    >
//      {/* Blocos visuais */}
//      {code.map((char, index) => {
//        const isActive = index === activeIndex || (isFilled && index === length - 1);
//        return (
//          <div
//            key={index}
//            className={`relative flex h-10 w-10 items-center justify-center border text-sm font-mono font-bold transition-all
//              ${error ? 'border-red-500' : isActive ? 'border-blue-500' : 'border-gray-600'}
//              bg-gray-800 text-white first:rounded-l-md last:rounded-r-md`}
//          >
//            {char}
//            {isActive && (
//              <span className="absolute inset-0 flex items-center justify-center animate-caret-blink text-blue-400">
//                |
//              </span>
//            )}
//          </div>
//        );
//      })}
//
//      {/* Input invisível */}
//      <input
//        autoComplete="one-time-code"
//        inputMode="text"
//        pattern="^[a-zA-Z0-9]+$"
//        maxLength={length}
//        value={code.join('')}
//        onChange={handleChange}
//        onPaste={handlePaste}
//        ref={inputRef}
//        name="code"
//        className="absolute inset-0 w-[calc(100%+40px)] h-full text-left opacity-0 caret-transparent bg-transparent border-none outline-none font-mono tracking-[0.5em]"
//        style={{
//          color: 'transparent',
//          pointerEvents: 'all',
//          fontSize: 'var(--root-height)',
//          fontVariantNumeric: 'tabular-nums',
//          clipPath: 'inset(0px 40px 0px 0px)',
//        }}
//      />
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//
//export default function OTPInput({
//  length = 8,
//  onComplete,
//  error = false,
//  initialValue = '',
//}) {
//  const [code, setCode] = useState(Array(length).fill(''));
//  const inputRef = useRef(null);
//
//  // Preenche valor inicial se existir
//  useEffect(() => {
//    if (initialValue) {
//      const chars = initialValue.slice(0, length).split('');
//      setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//    }
//  }, [initialValue, length]);
//
//  // Chama onComplete quando todos os blocos estiverem preenchidos
//  useEffect(() => {
//    const fullCode = code.join('');
//    if (fullCode.length === length && !code.includes('')) {
//      onComplete?.(fullCode);
//    }
//  }, [code, length, onComplete]);
//
//  // Manipula colagem
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, length).split('');
//    const updated = Array(length).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char.toUpperCase();
//    });
//    setCode(updated);
//  }
//
//  // Manipula digitação
//  function handleChange(e) {
//    const chars = e.target.value.slice(0, length).split('');
//    setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//  }
//
//  const activeIndex = code.findIndex(c => c === '');
//  const isFilled = activeIndex === -1;
//
//  return (
//    <div
//      data-input-otp-container="true"
//      className="relative flex items-center gap-2 cursor-text select-none"
//      style={{ '--root-height': '40px' }}
//      onClick={() => inputRef.current?.focus()}
//    >
//      {/* Blocos visuais */}
//      {code.map((char, index) => {
//        const isActive = index === activeIndex || (isFilled && index === length - 1);
//        return (
//          <div
//            key={index}
//            className={`relative flex h-10 w-10 items-center justify-center border text-sm font-mono font-bold transition-all
//              ${error ? 'border-red-500' : isActive ? 'border-blue-500' : 'border-gray-600'}
//              bg-gray-800 text-white first:rounded-l-md last:rounded-r-md`}
//          >
//            {char}
//            {isActive && (
//              <span className="absolute inset-0 flex items-center justify-center animate-blink text-blue-400">
//                |
//              </span>
//            )}
//          </div>
//        );
//      })}
//
//      {/* Input invisível */}
//      <input
//        autoComplete="one-time-code"
//        inputMode="text"
//        pattern="^[a-zA-Z0-9]+$"
//        maxLength={length}
//        value={code.join('')}
//        onChange={handleChange}
//        onPaste={handlePaste}
//        ref={inputRef}
//        name="code"
//        className="absolute inset-0 w-[calc(100%+40px)] h-full text-left opacity-0 caret-transparent bg-transparent border-none outline-none font-mono tracking-[0.5em]"
//        style={{
//          color: 'transparent',
//          pointerEvents: 'all',
//          fontSize: 'var(--root-height)',
//          fontVariantNumeric: 'tabular-nums',
//          clipPath: 'inset(0px 40px 0px 0px)',
//        }}
//      />
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//
//export default function OTPInput({
//  length = 8,
//  onComplete,
//  error = false,
//  initialValue = '',
//}) {
//  const [code, setCode] = useState(Array(length).fill(''));
//  const inputRef = useRef(null);
//
//  // Preenche valor inicial se existir
//  useEffect(() => {
//    if (initialValue) {
//      const chars = initialValue.slice(0, length).split('');
//      setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//    }
//  }, [initialValue, length]);
//
//  // Chama onComplete quando todos os blocos estiverem preenchidos
//  useEffect(() => {
//    const fullCode = code.join('');
//    if (fullCode.length === length && !code.includes('')) {
//      onComplete?.(fullCode);
//    }
//  }, [code, length, onComplete]);
//
//  // Manipula colagem
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, length).split('');
//    const updated = Array(length).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char.toUpperCase();
//    });
//    setCode(updated);
//  }
//
//  // Manipula digitação
//  function handleChange(e) {
//    const chars = e.target.value.slice(0, length).split('');
//    setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//  }
//
//  // Índice do bloco ativo
//  const activeIndex = code.findIndex(c => c === '');
//  const isFilled = activeIndex === -1;
//
//  return (
//    <div
//      data-input-otp-container="true"
//      className="relative flex items-center gap-2 cursor-text select-none"
//      style={{ '--root-height': '40px' }}
//      onClick={() => inputRef.current?.focus()}
//    >
//      {/* Blocos visuais */}
//      {code.map((char, index) => {
//        const isActive = index === activeIndex || (isFilled && index === length - 1);
//        return (
//          <div
//            key={index}
//            className={`relative flex h-10 w-10 items-center justify-center border text-sm font-mono font-bold transition-all
//              ${error ? 'border-red-500' : isActive ? 'border-blue-500' : 'border-gray-600'}
//              bg-gray-800 text-white first:rounded-l-md last:rounded-r-md`}
//          >
//            {char}
//            {isActive && (
//              <span className="absolute inset-0 flex items-center justify-center animate-blink text-blue-400">
//                |
//              </span>
//            )}
//          </div>
//        );
//      })}
//
//      {/* Input invisível */}
//      <input
//        autoComplete="one-time-code"
//        inputMode="text"
//        pattern="^[a-zA-Z0-9]+$"
//        maxLength={length}
//        value={code.join('')}
//        onChange={handleChange}
//        onPaste={handlePaste}
//        ref={inputRef}
//        name="code"
//        className="absolute inset-0 w-[calc(100%+40px)] h-full text-left opacity-0 caret-transparent bg-transparent border-none outline-none font-mono tracking-[0.5em]"
//        style={{
//          color: 'transparent',
//          pointerEvents: 'all',
//          fontSize: 'var(--root-height)',
//          fontVariantNumeric: 'tabular-nums',
//          clipPath: 'inset(0px 40px 0px 0px)',
//        }}
//      />
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//
//export default function OTPInput({
//  length = 8,
//  onComplete,
//  error = false,
//  initialValue = '',
//}) {
//  const [code, setCode] = useState(Array(length).fill(''));
//  const inputRef = useRef(null);
//
//  // Preenche valor inicial se existir
//  useEffect(() => {
//    if (initialValue) {
//      const chars = initialValue.slice(0, length).split('');
//      setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//    }
//  }, [initialValue, length]);
//
//  // Chama onComplete quando todos os blocos estiverem preenchidos
//  useEffect(() => {
//    const fullCode = code.join('');
//    if (fullCode.length === length && !code.includes('')) {
//      onComplete?.(fullCode);
//    }
//  }, [code, length, onComplete]);
//
//  // Manipula colagem
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, length).split('');
//    const updated = Array(length).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char.toUpperCase();
//    });
//    setCode(updated);
//  }
//
//  // Manipula digitação
//  function handleChange(e) {
//    const chars = e.target.value.slice(0, length).split('');
//    setCode(Array(length).fill('').map((_, i) => chars[i] || ''));
//  }
//
//  return (
//    <div
//      data-input-otp-container="true"
//      className="relative flex items-center gap-2 cursor-text select-none"
//      style={{ '--root-height': '40px' }}
//      onClick={() => inputRef.current?.focus()}
//    >
//      {/* Blocos visuais */}
//      {code.map((char, index) => (
//        <div
//          key={index}
//          className={`relative flex h-10 w-10 items-center justify-center border text-sm font-mono font-bold transition-all
//            ${error ? 'border-red-500' : 'border-gray-600'} bg-gray-800 text-white
//            first:rounded-l-md last:rounded-r-md`}
//        >
//          {char}
//        </div>
//      ))}
//
//      {/* Input invisível */}
//      <input
//        autoComplete="one-time-code"
//        inputMode="text"
//        pattern="^[a-zA-Z0-9]+$"
//        maxLength={length}
//        value={code.join('')}
//        onChange={handleChange}
//        onPaste={handlePaste}
//        ref={inputRef}
//        name="code"
//        className="absolute inset-0 w-[calc(100%+40px)] h-full text-left opacity-0 caret-transparent bg-transparent border-none outline-none font-mono tracking-[0.5em]"
//        style={{
//          color: 'transparent',
//          pointerEvents: 'all',
//          fontSize: 'var(--root-height)',
//          fontVariantNumeric: 'tabular-nums',
//          clipPath: 'inset(0px 40px 0px 0px)',
//        }}
//      />
//    </div>
//  );
//}