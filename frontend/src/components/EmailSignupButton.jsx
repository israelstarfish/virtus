import { useState } from 'react';

export default function SignupEmailButton({ onSubmit }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onSubmit(); // função que envia o e-mail ou inicia o cadastro
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="submit"
        onClick={handleClick}
        disabled={loading}
        aria-disabled={loading}
        role="button"
        className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
          ${loading ? 'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50' : 'hover:cursor-pointer'}
          bg-blue-700 hover:bg-blue-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
      >
        {loading && (
          <span className="absolute flex size-full items-center justify-center bg-inherit">
            <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
          </span>
        )}
        <span className={loading ? 'invisible' : 'visible'}>
          Inscrever-se com e-mail
        </span>
      </button>
    </div>
  );
}