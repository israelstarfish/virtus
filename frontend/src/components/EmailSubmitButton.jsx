import { useState } from 'react';

export default function EmailSubmitButton({ onSubmit }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onSubmit(); // função externa que envia o e-mail
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="submit"
      onClick={handleClick}
      disabled={loading}
      aria-disabled={loading}
      role="button"
      className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
        ${loading ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
        bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
    >
      {loading && (
        <span className="absolute flex size-full items-center justify-center bg-inherit">
          <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
        </span>
      )}
      <span className={`${loading ? 'invisible' : 'visible'}`}>
        Entrar com endereço de e-mail
      </span>
    </button>
  );
}