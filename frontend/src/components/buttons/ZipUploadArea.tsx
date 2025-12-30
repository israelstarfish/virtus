//frontend/src/components/buttons/ZipUploadArea.tsx

'use client';

import { useRef, useState, useEffect } from 'react';
import JSZip from 'jszip';

type Props = {
  onFileSelect?: (file: File) => void;
  manualMode?: boolean;
  onEntrypointSelect?: (entry: string) => void;
  onEntrypointListUpdate?: (list: string[]) => void;
  resetTrigger?: number; // ✅ novo prop para reset externo
};

export default function ZipUploadArea({
  onFileSelect,
  manualMode,
  onEntrypointSelect,
  onEntrypointListUpdate,
  resetTrigger,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTree, setFileTree] = useState<string[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);

  const allowedExtensions = [
    '.js', '.ts', '.py', '.go', '.rs', '.php', '.cs', '.ex', '.java', '.kt',
    '.lua', '.html', '.rb', '.swift', '.c', '.cpp', '.sh', '.mjs', '.vue', '.yml'
  ];

  // ✅ limpa estado interno quando resetTrigger muda
  useEffect(() => {
    setSelectedFile(null);
    setFileTree([]);
  }, [resetTrigger]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0 && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      Array.from(files).forEach(file => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;

      const changeEvent = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(changeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);

    setLoadingTree(true);

    try {
      const zip = await JSZip.loadAsync(file);
      const fileList: string[] = [];
      let configEntrypoint = "";

      zip.forEach((relativePath) => {
        fileList.push(relativePath);
      });

      const configFile = zip.file("config.virtus");
      if (configFile) {
        const configText = await configFile.async("text");
        const match = configText.match(/entrypoint\s*=\s*(.+)/);
        if (match) {
          configEntrypoint = match[1].trim();
        }
      }

      setFileTree(fileList);

      const validEntrypoints = fileList.filter((f) =>
        allowedExtensions.some((ext) => f.toLowerCase().endsWith(ext))
      );

      if (onEntrypointListUpdate) {
        onEntrypointListUpdate(validEntrypoints);
      }

      if (manualMode) {
        if (onEntrypointSelect) {
          onEntrypointSelect(validEntrypoints[0] || '');
        }
      } else {
        if (onEntrypointSelect) {
          onEntrypointSelect(configEntrypoint || '');
        }
      }
    } catch (err) {
      console.error("Erro ao ler ZIP no frontend:", err);
      setFileTree([]);
      if (onEntrypointSelect) onEntrypointSelect('');
      if (onEntrypointListUpdate) onEntrypointListUpdate([]);
    } finally {
      setLoadingTree(false);
    }

    event.target.value = "";
  };

  return (
    <div className="px-6 md:h-100" data-slot="card-content">
      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
        {/* Área de upload */}
        <div className="flex select-none flex-col gap-1.5">
          <input
            ref={fileInputRef}
            accept="application/zip,.zip"
            multiple
            tabIndex={-1}
            type="file"
            onChange={handleFileSelect}
            style={{
              border: 0,
              clip: 'rect(0px, 0px, 0px, 0px)',
              clipPath: 'inset(50%)',
              height: '1px',
              margin: '0px -1px -1px 0px',
              overflow: 'hidden',
              padding: 0,
              position: 'absolute',
              width: '1px',
              whiteSpace: 'nowrap',
            }}
          />

          <div
            role="presentation"
            tabIndex={0}
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
          >
            <div className="flex size-full flex-col items-center justify-center text-center">
              {selectedFile ? (
                <>
                  <img
                    alt="Arquivo selecionado"
                    src="/assets/pages/upload/file-1.svg"
                    width={128}
                    height={128}
                    className="mb-2"
                  />
                  <p className="text-sm text-white font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-secondary">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <img
                    alt="Área de upload"
                    src="/assets/pages/upload/file-upload.svg"
                    width={256}
                    height={155}
                  />
                  <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
                  <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
                </>
              )}
              <div className="mt-6">
                <button
                  type="button"
                  role="button"
                  className="cursor-pointer bg-background text-primary text-sm font-medium rounded-md px-4 py-2 shadow-border hover:bg-virtus-600"
                >
                  Selecione seu arquivo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Árvore de arquivos */}
        <div className="motion-opacity-in-0 flex h-100 flex-col items-center justify-center w-full">
          {loadingTree ? (
            <p className="text-sm text-secondary">Carregando arquivos...</p>
          ) : fileTree.length > 0 ? (
            <ul className="text-sm text-left text-secondary space-y-1 max-h-[230px] overflow-y-auto w-full px-2">
              {fileTree.map((file, i) => (
                <li key={i} className="truncate">{file}</li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-secondary text-sm">
              Selecione um arquivo para visualizar sua árvore de arquivos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

//frontend/src/components/buttons/ZipUploadArea.tsx

//'use client';
//
//import { useRef, useState, useEffect } from 'react';
//import JSZip from 'jszip';
//
//type Props = {
//  onFileSelect?: (file: File) => void;
//  manualMode?: boolean;
//  onEntrypointSelect?: (entry: string) => void;
//  onEntrypointListUpdate?: (list: string[]) => void;
//  resetTrigger?: number; // ✅ novo prop para reset externo
//};
//
//export default function ZipUploadArea({
//  onFileSelect,
//  manualMode,
//  onEntrypointSelect,
//  onEntrypointListUpdate,
//  resetTrigger,
//}: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//  const [selectedFile, setSelectedFile] = useState<File | null>(null);
//  const [fileTree, setFileTree] = useState<string[]>([]);
//  const [loadingTree, setLoadingTree] = useState(false);
//
//  const allowedExtensions = [
//    '.js', '.ts', '.py', '.go', '.rs', '.php', '.cs', '.ex', '.java', '.kt',
//    '.lua', '.html', '.rb', '.swift', '.c', '.cpp', '.sh', '.mjs', '.vue', '.yml'
//  ];
//
//  // ✅ limpa estado interno quando resetTrigger muda
//  useEffect(() => {
//    setSelectedFile(null);
//    setFileTree([]);
//  }, [resetTrigger]);
//
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//    const file = event.target.files?.[0];
//    if (!file) return;
//
//    setSelectedFile(file);
//    if (onFileSelect) onFileSelect(file);
//
//    setLoadingTree(true);
//
//    try {
//      const zip = await JSZip.loadAsync(file);
//      const fileList: string[] = [];
//      let configEntrypoint = "";
//
//      zip.forEach((relativePath) => {
//        fileList.push(relativePath);
//      });
//
//      const configFile = zip.file("config.virtus");
//      if (configFile) {
//        const configText = await configFile.async("text");
//        const match = configText.match(/entrypoint\s*=\s*(.+)/);
//        if (match) {
//          configEntrypoint = match[1].trim();
//        }
//      }
//
//      setFileTree(fileList);
//
//      const validEntrypoints = fileList.filter((f) =>
//        allowedExtensions.some((ext) => f.toLowerCase().endsWith(ext))
//      );
//
//      if (onEntrypointListUpdate) {
//        onEntrypointListUpdate(validEntrypoints);
//      }
//
//      if (manualMode) {
//        if (onEntrypointSelect) {
//          onEntrypointSelect(validEntrypoints[0] || '');
//        }
//      } else {
//        if (onEntrypointSelect) {
//          onEntrypointSelect(configEntrypoint || '');
//        }
//      }
//    } catch (err) {
//      console.error("Erro ao ler ZIP no frontend:", err);
//      setFileTree([]);
//      if (onEntrypointSelect) onEntrypointSelect('');
//      if (onEntrypointListUpdate) onEntrypointListUpdate([]);
//    } finally {
//      setLoadingTree(false);
//    }
//
//    event.target.value = "";
//  };
//
//  return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center text-center">
//              {selectedFile ? (
//                <>
//                  <img
//                    alt="Arquivo selecionado"
//                    src="/assets/pages/upload/file-1.svg"
//                    width={128}
//                    height={128}
//                    className="mb-2"
//                  />
//                  <p className="text-sm text-white font-medium">{selectedFile.name}</p>
//                  <p className="text-xs text-secondary">
//                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
//                  </p>
//                </>
//              ) : (
//                <>
//                  <img
//                    alt="Área de upload"
//                    src="/assets/pages/upload/file-upload.svg"
//                    width={256}
//                    height={155}
//                  />
//                  <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                  <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                </>
//              )}
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="cursor-pointer bg-background text-primary text-sm font-medium rounded-md px-4 py-2 shadow-border hover:bg-virtus-600"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Árvore de arquivos */}
//        <div className="motion-opacity-in-0 flex h-100 flex-col items-center justify-center w-full">
//          {loadingTree ? (
//            <p className="text-sm text-secondary">Carregando arquivos...</p>
//          ) : fileTree.length > 0 ? (
//            <ul className="text-sm text-left text-secondary space-y-1 max-h-[230px] overflow-y-auto w-full px-2">
//              {fileTree.map((file, i) => (
//                <li key={i} className="truncate">{file}</li>
//              ))}
//            </ul>
//          ) : (
//            <p className="text-center text-secondary text-sm">
//              Selecione um arquivo para visualizar sua árvore de arquivos.
//            </p>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//}

//frontend/src/components/buttons/ZipUploadArea.tsx

//'use client';
//
//import { useRef, useState } from 'react';
//import JSZip from 'jszip';
//
//type Props = {
//  onFileSelect?: (file: File) => void;
//  manualMode?: boolean;
//  onEntrypointSelect?: (entry: string) => void;
//  onEntrypointListUpdate?: (list: string[]) => void;
//};
//
//export default function ZipUploadArea({
//  onFileSelect,
//  manualMode,
//  onEntrypointSelect,
//  onEntrypointListUpdate,
//}: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//  const [selectedFile, setSelectedFile] = useState<File | null>(null);
//  const [fileTree, setFileTree] = useState<string[]>([]);
//  const [loadingTree, setLoadingTree] = useState(false);
//
//  const allowedExtensions = [
//    '.js', '.ts', '.py', '.go', '.rs', '.php', '.cs', '.ex', '.java', '.kt',
//    '.lua', '.html', '.rb', '.swift', '.c', '.cpp', '.sh', '.mjs', '.vue', '.yml'
//  ];
//
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//    const file = event.target.files?.[0];
//    if (!file) return;
//
//    setSelectedFile(file);
//    if (onFileSelect) onFileSelect(file);
//
//    setLoadingTree(true);
//
//    try {
//      const zip = await JSZip.loadAsync(file);
//      const fileList: string[] = [];
//      let configEntrypoint = "";
//
//      zip.forEach((relativePath) => {
//        fileList.push(relativePath);
//      });
//
//      const configFile = zip.file("config.virtus");
//      if (configFile) {
//        const configText = await configFile.async("text");
//        const match = configText.match(/entrypoint\s*=\s*(.+)/);
//        if (match) {
//          configEntrypoint = match[1].trim();
//        }
//      }
//
//      setFileTree(fileList);
//
//      const validEntrypoints = fileList.filter((f) =>
//        allowedExtensions.some((ext) => f.toLowerCase().endsWith(ext))
//      );
//
//      if (onEntrypointListUpdate) {
//        onEntrypointListUpdate(validEntrypoints);
//      }
//
//      if (manualMode) {
//        if (onEntrypointSelect) {
//          onEntrypointSelect(validEntrypoints[0] || '');
//        }
//      } else {
//        if (onEntrypointSelect) {
//          onEntrypointSelect(configEntrypoint || '');
//        }
//      }
//    } catch (err) {
//      console.error("Erro ao ler ZIP no frontend:", err);
//      setFileTree([]);
//      if (onEntrypointSelect) onEntrypointSelect('');
//      if (onEntrypointListUpdate) onEntrypointListUpdate([]);
//    } finally {
//      setLoadingTree(false);
//    }
//
//    event.target.value = "";
//  };
//
//  return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center text-center">
//              {selectedFile ? (
//                <>
//                  <img
//                    alt="Arquivo selecionado"
//                    src="/assets/pages/upload/file-1.svg"
//                    width={128}
//                    height={128}
//                    className="mb-2"
//                  />
//                  <p className="text-sm text-white font-medium">{selectedFile.name}</p>
//                  <p className="text-xs text-secondary">
//                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
//                  </p>
//                </>
//              ) : (
//                <>
//                  <img
//                    alt="Área de upload"
//                    src="/assets/pages/upload/file-upload.svg"
//                    width={256}
//                    height={155}
//                  />
//                  <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                  <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                </>
//              )}
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="cursor-pointer bg-background text-primary text-sm font-medium rounded-md px-4 py-2 shadow-border hover:bg-virtus-600"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Árvore de arquivos */}
//        <div className="motion-opacity-in-0 flex h-100 flex-col items-center justify-center w-full">
//          {loadingTree ? (
//            <p className="text-sm text-secondary">Carregando arquivos...</p>
//          ) : fileTree.length > 0 ? (
//            <ul className="text-sm text-left text-secondary space-y-1 max-h-[230px] overflow-y-auto w-full px-2">
//              {fileTree.map((file, i) => (
//                <li key={i} className="truncate">{file}</li>
//              ))}
//            </ul>
//          ) : (
//            <p className="text-center text-secondary text-sm">
//              Selecione um arquivo para visualizar sua árvore de arquivos.
//            </p>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//}

//'use client';
//
//import { useRef, useState } from 'react';
//import JSZip from 'jszip';
//
//type Props = {
//  onFileSelect?: (file: File) => void;
//  manualMode?: boolean;
//  onEntrypointSelect?: (entry: string) => void;
//};
//
//export default function ZipUploadArea({ onFileSelect, manualMode, onEntrypointSelect }: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//  const [selectedFile, setSelectedFile] = useState<File | null>(null);
//  const [fileTree, setFileTree] = useState<string[]>([]);
//  const [loadingTree, setLoadingTree] = useState(false);
//
//  const allowedExtensions = [
//    '.js', '.ts', '.py', '.go', '.rs', '.php', '.cs', '.ex', '.java', '.kt',
//    '.lua', '.html', '.rb', '.swift', '.c', '.cpp', '.sh', '.mjs', '.vue', '.yml'
//  ];
//
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//  const file = event.target.files?.[0];
//  if (!file) return;
//
//  setSelectedFile(file);
//  if (onFileSelect) onFileSelect(file);
//
//  setLoadingTree(true);
//
//  try {
//    const zip = await JSZip.loadAsync(file);
//    const fileList: string[] = [];
//    let configEntrypoint = "";
//
//    zip.forEach((relativePath) => {
//      fileList.push(relativePath);
//    });
//
//    const configFile = zip.file("config.virtus");
//    if (configFile) {
//      const configText = await configFile.async("text");
//      const match = configText.match(/entrypoint\s*=\s*(.+)/);
//      if (match) {
//        configEntrypoint = match[1].trim();
//      }
//    }
//
//    setFileTree(fileList);
//
//    const validEntrypoints = fileList.filter((f) =>
//      allowedExtensions.some((ext) => f.toLowerCase().endsWith(ext))
//    );
//
//    if (manualMode) {
//      if (onEntrypointSelect) {
//        onEntrypointSelect(validEntrypoints[0] || '');
//      }
//    } else {
//      if (onEntrypointSelect) {
//        onEntrypointSelect(configEntrypoint || '');
//      }
//    }
//  } catch (err) {
//    console.error("Erro ao ler ZIP no frontend:", err);
//    setFileTree([]);
//    if (onEntrypointSelect) onEntrypointSelect('');
//  } finally {
//    setLoadingTree(false);
//  }
//
//  event.target.value = "";
//};
//
//  //const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//  //  const file = event.target.files?.[0];
//  //  if (!file) return;
//  //
//  //  setSelectedFile(file);
//  //  if (onFileSelect) onFileSelect(file);
//  //
//  //  setLoadingTree(true);
//  //
//  //  try {
//  //    const zip = await JSZip.loadAsync(file);
//  //    const fileList: string[] = [];
//  //    let configEntrypoint = "";
//  //
//  //    zip.forEach((relativePath) => {
//  //      fileList.push(relativePath);
//  //    });
//  //
//  //    const configFile = zip.file("config.virtus");
//  //    if (configFile) {
//  //      const configText = await configFile.async("text");
//  //      const match = configText.match(/entrypoint\s*=\s*(.+)/);
//  //      if (match) {
//  //        configEntrypoint = match[1].trim();
//  //      }
//  //    }
//  //
//  //    setFileTree(fileList);
//  //
//  //    if (!manualMode) {
//  //      if (onEntrypointSelect) onEntrypointSelect(configEntrypoint || '');
//  //    }
//  //  } catch (err) {
//  //    console.error("Erro ao ler ZIP no frontend:", err);
//  //    setFileTree([]);
//  //    if (onEntrypointSelect) onEntrypointSelect('');
//  //  } finally {
//  //    setLoadingTree(false);
//  //  }
//  //
//  //  event.target.value = "";
//  //};
//
//  return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center text-center">
//              {selectedFile ? (
//                <>
//                  <img
//                    alt="Arquivo selecionado"
//                    src="/assets/pages/upload/file-1.svg"
//                    width={128}
//                    height={128}
//                    className="mb-2"
//                  />
//                  <p className="text-sm text-white font-medium">{selectedFile.name}</p>
//                  <p className="text-xs text-secondary">
//                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
//                  </p>
//                </>
//              ) : (
//                <>
//                  <img
//                    alt="Área de upload"
//                    src="/assets/pages/upload/file-upload.svg"
//                    width={256}
//                    height={155}
//                  />
//                  <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                  <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                </>
//              )}
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="cursor-pointer bg-background text-primary text-sm font-medium rounded-md px-4 py-2 shadow-border hover:bg-virtus-600"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Árvore de arquivos */}
//        <div className="motion-opacity-in-0 flex h-100 flex-col items-center justify-center w-full">
//          {loadingTree ? (
//            <p className="text-sm text-secondary">Carregando arquivos...</p>
//          ) : fileTree.length > 0 ? (
//            <ul className="text-sm text-left text-secondary space-y-1 max-h-[230px] overflow-y-auto w-full px-2">
//              {fileTree.map((file, i) => (
//                <li key={i} className="truncate">{file}</li>
//              ))}
//            </ul>
//          ) : (
//            <p className="text-center text-secondary text-sm">
//              Selecione um arquivo para visualizar sua árvore de arquivos.
//            </p>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//}

//'use client';
//
//import { useRef, useState } from 'react';
//import JSZip from 'jszip';
//
//type Props = {
//  onFileSelect?: (file: File) => void;
//  manualMode?: boolean;
//  onEntrypointSelect?: (entry: string) => void;
//};
//
//export default function ZipUploadArea({ onFileSelect, manualMode, onEntrypointSelect }: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//  const [selectedFile, setSelectedFile] = useState<File | null>(null);
//  const [fileTree, setFileTree] = useState<string[]>([]);
//  const [loadingTree, setLoadingTree] = useState(false);
//  const [entryFile, setEntryFile] = useState('');
//  const [showEntrypointOptions, setShowEntrypointOptions] = useState(false);
//
//  const allowedExtensions = [
//    '.js', '.ts', '.py', '.go', '.rs', '.php', '.cs', '.ex', '.java', '.kt',
//    '.lua', '.html', '.rb', '.swift', '.c', '.cpp', '.sh', '.mjs', '.vue', '.yml'
//  ];
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//    const file = event.target.files?.[0];
//    if (!file) return;
//
//    setSelectedFile(file);
//    if (onFileSelect) onFileSelect(file);
//
//    setLoadingTree(true);
//
//    try {
//      const zip = await JSZip.loadAsync(file);
//      const fileList: string[] = [];
//      let configEntrypoint = "";
//
//      zip.forEach((relativePath) => {
//        fileList.push(relativePath);
//      });
//
//      const configFile = zip.file("config.virtus");
//      if (configFile) {
//        const configText = await configFile.async("text");
//        const match = configText.match(/entrypoint\s*=\s*(.+)/);
//        if (match) {
//          configEntrypoint = match[1].trim();
//        }
//      }
//
//      setFileTree(fileList);
//
//      if (!manualMode) {
//        setEntryFile(configEntrypoint || '');
//        if (onEntrypointSelect) onEntrypointSelect(configEntrypoint || '');
//      }
//    } catch (err) {
//      console.error("Erro ao ler ZIP no frontend:", err);
//      setFileTree([]);
//      setEntryFile('');
//    } finally {
//      setLoadingTree(false);
//    }
//
//    event.target.value = "";
//  };
//  return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center text-center">
//              {selectedFile ? (
//                <>
//                  <img
//                    alt="Arquivo selecionado"
//                    src="/assets/pages/upload/file-1.svg"
//                    width={128}
//                    height={128}
//                    className="mb-2"
//                  />
//                  <p className="text-sm text-white font-medium">{selectedFile.name}</p>
//                  <p className="text-xs text-secondary">
//                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
//                  </p>
//                </>
//              ) : (
//                <>
//                  <img
//                    alt="Área de upload"
//                    src="/assets/pages/upload/file-upload.svg"
//                    width={256}
//                    height={155}
//                  />
//                  <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                  <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                </>
//              )}
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="cursor-pointer bg-background text-primary text-sm font-medium rounded-md px-4 py-2 shadow-border hover:bg-virtus-600"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//        {/* Árvore de arquivos + seleção de entrypoint */}
//        <div className="motion-opacity-in-0 flex h-100 flex-col items-center justify-center w-full">
//          {loadingTree ? (
//            <p className="text-sm text-secondary">Carregando arquivos...</p>
//          ) : fileTree.length > 0 ? (
//            <>
//              <ul className="text-sm text-left text-secondary space-y-1 max-h-[230px] overflow-y-auto w-full px-2">
//                {fileTree.map((file, i) => (
//                  <li key={i} className="truncate">{file}</li>
//                ))}
//              </ul>
//
//              {manualMode && (
//                <div className="mt-4 w-full px-2">
//                  <label className="block text-sm font-medium text-white mb-1">
//                    Selecione um arquivo principal
//                  </label>
//                  <div className="relative w-full">
//                    <button
//                      type="button"
//                      onClick={() => setShowEntrypointOptions((prev) => !prev)}
//                      className="flex items-center justify-between rounded-md border border-border bg-background px-4 h-10 text-sm text-white w-full"
//                    >
//                      {entryFile || 'Escolher arquivo'}
//                      <svg
//                        xmlns="http://www.w3.org/2000/svg"
//                        width="20"
//                        height="20"
//                        fill="currentColor"
//                        viewBox="0 0 256 256"
//                        className={`text-secondary transition-transform duration-250 ${showEntrypointOptions ? 'rotate-180' : ''}`}
//                      >
//                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                      </svg>
//                    </button>
//
//                    {showEntrypointOptions && (
//                      <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white max-h-64 overflow-y-auto">
//                        {fileTree
//                          .filter((f) => allowedExtensions.some((ext) => f.toLowerCase().endsWith(ext)))
//                          .map((file, i) => (
//                            <li
//                              key={i}
//                              className="px-4 py-2 hover:bg-virtus-600 cursor-pointer truncate"
//                              onClick={() => {
//                                setEntryFile(file);
//                                setShowEntrypointOptions(false);
//                                if (onEntrypointSelect) onEntrypointSelect(file);
//                              }}
//                            >
//                              {file}
//                            </li>
//                          ))}
//                      </ul>
//                    )}
//                  </div>
//                </div>
//              )}
//            </>
//          ) : (
//            <p className="text-center text-secondary text-sm">
//              Selecione um arquivo para visualizar sua árvore de arquivos.
//            </p>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//}

//'use client';
//
//import { useRef, useState } from 'react';
//import JSZip from 'jszip';
//
//type Props = {
//  onFileSelect?: (file: File) => void;
//  manualMode?: boolean;
//};
//
//export default function ZipUploadArea({ onFileSelect, manualMode }: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//  const [selectedFile, setSelectedFile] = useState<File | null>(null);
//  const [fileTree, setFileTree] = useState<string[]>([]);
//  const [loadingTree, setLoadingTree] = useState(false);
//  const [entryFile, setEntryFile] = useState('');
//
//  const allowedExtensions = [
//    '.js', '.ts', '.py', '.go', '.rs', '.php', '.cs', '.ex', '.java', '.kt',
//    '.lua', '.html', '.rb', '.swift', '.c', '.cpp', '.sh', '.mjs', '.vue', '.yml'
//  ];
//    const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//    const file = event.target.files?.[0];
//    if (!file) return;
//
//    setSelectedFile(file);
//    if (onFileSelect) onFileSelect(file);
//
//    setLoadingTree(true);
//
//    try {
//      const zip = await JSZip.loadAsync(file);
//      const fileList: string[] = [];
//      let configEntrypoint = "";
//
//      zip.forEach((relativePath) => {
//        fileList.push(relativePath);
//      });
//
//      const configFile = zip.file("config.virtus");
//      if (configFile) {
//        const configText = await configFile.async("text");
//        const match = configText.match(/entrypoint\s*=\s*(.+)/);
//        if (match) {
//          configEntrypoint = match[1].trim();
//        }
//      }
//
//      setFileTree(fileList);
//
//      if (!manualMode) {
//        setEntryFile(configEntrypoint || '');
//      }
//    } catch (err) {
//      console.error("Erro ao ler ZIP no frontend:", err);
//      setFileTree([]);
//      setEntryFile('');
//    } finally {
//      setLoadingTree(false);
//    }
//
//    event.target.value = "";
//  };
//    return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center text-center">
//              {selectedFile ? (
//                <>
//                  <img
//                    alt="Arquivo selecionado"
//                    src="/assets/pages/upload/file-1.svg"
//                    width={128}
//                    height={128}
//                    className="mb-2"
//                  />
//                  <p className="text-sm text-white font-medium">{selectedFile.name}</p>
//                  <p className="text-xs text-secondary">
//                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
//                  </p>
//                </>
//              ) : (
//                <>
//                  <img
//                    alt="Área de upload"
//                    src="/assets/pages/upload/file-upload.svg"
//                    width={256}
//                    height={155}
//                  />
//                  <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                  <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                </>
//              )}
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="cursor-pointer bg-background text-primary text-sm font-medium rounded-md px-4 py-2 shadow-border hover:bg-virtus-600"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//                {/* Árvore de arquivos + seleção de entrypoint */}
//        <div className="motion-opacity-in-0 flex h-100 flex-col items-center justify-center w-full">
//          {loadingTree ? (
//            <p className="text-sm text-secondary">Carregando arquivos...</p>
//          ) : fileTree.length > 0 ? (
//            <>
//              <ul className="text-sm text-left text-secondary space-y-1 max-h-[230px] overflow-y-auto w-full px-2">
//                {fileTree.map((file, i) => (
//                  <li key={i} className="truncate">{file}</li>
//                ))}
//              </ul>
//
//              {manualMode && (
//                <div className="mt-4 w-full px-2">
//                  <label className="block text-sm font-medium text-white mb-1">
//                    Selecione um arquivo principal
//                  </label>
//                  <select
//                    value={entryFile}
//                    onChange={(e) => setEntryFile(e.target.value)}
//                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-white"
//                  >
//                    {fileTree
//                      .filter((f) =>
//                        allowedExtensions.some((ext) => f.toLowerCase().endsWith(ext))
//                      )
//                      .map((file, i) => (
//                        <option key={i} value={file}>
//                          {file}
//                        </option>
//                      ))}
//                  </select>
//                </div>
//              )}
//            </>
//          ) : (
//            <p className="text-center text-secondary text-sm">
//              Selecione um arquivo para visualizar sua árvore de arquivos.
//            </p>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//}

//'use client';
//
//import { useRef, useState } from 'react';
//import JSZip from 'jszip';
//
//type Props = {
//  onFileSelect?: (file: File) => void;
//  manualMode?: boolean;
//};
//
//export default function ZipUploadArea({ onFileSelect, manualMode }: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//  const [selectedFile, setSelectedFile] = useState<File | null>(null);
//  const [fileTree, setFileTree] = useState<string[]>([]);
//  const [loadingTree, setLoadingTree] = useState(false);
//  const [entryFile, setEntryFile] = useState('');
//
//  const entrypointPatterns = [
//    "index.js", "main.js", "app.js", "server.js", "start.js", "init.js",
//    "index.ts", "main.ts", "app.ts", "server.ts", "start.ts", "init.ts",
//    "index.py", "main.py", "app.py", "server.py", "run.py", "start.py", "init.py", "manage.py",
//    "index.go", "main.go", "app.go", "server.go", "start.go", "init.go",
//    "index.rs", "main.rs", "lib.rs", "app.rs", "server.rs",
//    "index.php", "main.php", "app.php", "server.php", "start.php", "init.php",
//    "index.cs", "main.cs", "program.cs", "app.cs", "startup.cs",
//    "index.ex", "main.ex", "app.ex", "server.ex", "start.ex", "init.ex",
//    "index.java", "Main.java", "App.java", "Application.java", "Start.java", "Server.java", "JMusicBot.java", "Launcher.java",
//    "index.kt", "Main.kt", "App.kt", "Application.kt", "Start.kt", "Server.kt",
//    "index.lua", "main.lua", "init.lua", "app.lua", "server.lua", "start.lua",
//    "index.html", "main.html", "app.html", "start.html", "init.html",
//    "main.rb", "app.rb", "server.rb", "start.rb", "init.rb",
//    "main.swift", "App.swift", "Start.swift",
//    "main.c", "app.c", "server.c", "main.cpp", "app.cpp", "server.cpp",
//    "start.sh", "run.sh", "deploy.sh", "init.sh",
//    "vite.config.ts", "nuxt.config.ts", "nest-cli.json",
//    "index.mjs", "main.mjs", "app.mjs", "server.mjs",
//  ];
//    const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//    const file = event.target.files?.[0];
//    if (!file) return;
//
//    setSelectedFile(file);
//    if (onFileSelect) onFileSelect(file);
//
//    setLoadingTree(true);
//
//    try {
//      const zip = await JSZip.loadAsync(file);
//      const fileList: string[] = [];
//      let configEntrypoint = "";
//
//      zip.forEach((relativePath) => {
//        fileList.push(relativePath);
//      });
//
//      const candidates = fileList.filter((f) =>
//        entrypointPatterns.some((p) => f.toLowerCase().endsWith(p.toLowerCase()))
//      );
//
//      const configFile = zip.file("config.virtus");
//      if (configFile) {
//        const configText = await configFile.async("text");
//        const match = configText.match(/entrypoint\s*=\s*(.+)/);
//        if (match) {
//          configEntrypoint = match[1].trim();
//        }
//      }
//
//      setFileTree(fileList);
//      setEntryFile(configEntrypoint || candidates[0] || '');
//    } catch (err) {
//      console.error("Erro ao ler ZIP no frontend:", err);
//      setFileTree([]);
//      setEntryFile('');
//    } finally {
//      setLoadingTree(false);
//    }
//
//    event.target.value = "";
//  };
//    return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center text-center">
//              {selectedFile ? (
//                <>
//                  <img
//                    alt="Arquivo selecionado"
//                    src="/assets/pages/upload/file-1.svg"
//                    width={128}
//                    height={128}
//                    className="mb-2"
//                  />
//                  <p className="text-sm text-white font-medium">{selectedFile.name}</p>
//                  <p className="text-xs text-secondary">
//                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
//                  </p>
//                </>
//              ) : (
//                <>
//                  <img
//                    alt="Área de upload"
//                    src="/assets/pages/upload/file-upload.svg"
//                    width={256}
//                    height={155}
//                  />
//                  <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                  <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                </>
//              )}
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="cursor-pointer bg-background text-primary text-sm font-medium rounded-md px-4 py-2 shadow-border hover:bg-virtus-600"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//                {/* Árvore de arquivos + seleção de entrypoint */}
//        <div className="motion-opacity-in-0 flex h-100 flex-col items-center justify-center w-full">
//          {loadingTree ? (
//            <p className="text-sm text-secondary">Carregando arquivos...</p>
//          ) : fileTree.length > 0 ? (
//            <>
//              <ul className="text-sm text-left text-secondary space-y-1 max-h-[230px] overflow-y-auto w-full px-2">
//                {fileTree.map((file, i) => (
//                  <li key={i} className="truncate">{file}</li>
//                ))}
//              </ul>
//
//              {manualMode && (
//                <div className="mt-4 w-full px-2">
//                  <label className="block text-sm font-medium text-white mb-1">
//                    Comando de inicialização
//                  </label>
//                  <select
//                    value={entryFile}
//                    onChange={(e) => setEntryFile(e.target.value)}
//                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-white"
//                  >
//                    {fileTree
//                      .filter((f) =>
//                        entrypointPatterns.some((p) => f.toLowerCase().endsWith(p.toLowerCase()))
//                      )
//                      .map((file, i) => (
//                        <option key={i} value={file}>
//                          {file}
//                        </option>
//                      ))}
//                  </select>
//                </div>
//              )}
//            </>
//          ) : (
//            <p className="text-center text-secondary text-sm">
//              Selecione um arquivo para visualizar sua árvore de arquivos.
//            </p>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//}

//'use client';
//
//import { useRef, useState } from 'react';
//import JSZip from 'jszip';
//
//type Props = {
//  onFileSelect?: (file: File) => void;
//};
//
//export default function ZipUploadArea({ onFileSelect }: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//  const [selectedFile, setSelectedFile] = useState<File | null>(null);
//  const [fileTree, setFileTree] = useState<string[]>([]);
//  const [loadingTree, setLoadingTree] = useState(false);
//  const [entryFile, setEntryFile] = useState('');
//
//  const entrypointPatterns = [
//    "index.js", "main.js", "app.js", "server.js", "start.js", "init.js",
//    "index.ts", "main.ts", "app.ts", "server.ts", "start.ts", "init.ts",
//    "index.py", "main.py", "app.py", "server.py", "run.py", "start.py", "init.py", "manage.py",
//    "index.go", "main.go", "app.go", "server.go", "start.go", "init.go",
//    "index.rs", "main.rs", "lib.rs", "app.rs", "server.rs",
//    "index.php", "main.php", "app.php", "server.php", "start.php", "init.php",
//    "index.cs", "main.cs", "program.cs", "app.cs", "startup.cs",
//    "index.ex", "main.ex", "app.ex", "server.ex", "start.ex", "init.ex",
//    "index.java", "Main.java", "App.java", "Application.java", "Start.java", "Server.java", "JMusicBot.java", "Launcher.java",
//    "index.kt", "Main.kt", "App.kt", "Application.kt", "Start.kt", "Server.kt",
//    "index.lua", "main.lua", "init.lua", "app.lua", "server.lua", "start.lua",
//    "index.html", "main.html", "app.html", "start.html", "init.html",
//    "main.rb", "app.rb", "server.rb", "start.rb", "init.rb",
//    "main.swift", "App.swift", "Start.swift",
//    "main.c", "app.c", "server.c", "main.cpp", "app.cpp", "server.cpp",
//    "start.sh", "run.sh", "deploy.sh", "init.sh",
//    "vite.config.ts", "nuxt.config.ts", "nest-cli.json",
//    "index.mjs", "main.mjs", "app.mjs", "server.mjs",
//  ];
//    const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//    const file = event.target.files?.[0];
//    if (!file) return;
//
//    setSelectedFile(file);
//    if (onFileSelect) onFileSelect(file);
//
//    setLoadingTree(true);
//
//    try {
//      const zip = await JSZip.loadAsync(file);
//      const fileList: string[] = [];
//      let configEntrypoint = "";
//
//      zip.forEach((relativePath) => {
//        fileList.push(relativePath);
//      });
//
//      const candidates = fileList.filter((f) =>
//        entrypointPatterns.some((p) => f.toLowerCase().endsWith(p.toLowerCase()))
//      );
//
//      const configFile = zip.file("config.virtus");
//      if (configFile) {
//        const configText = await configFile.async("text");
//        const match = configText.match(/entrypoint\s*=\s*(.+)/);
//        if (match) {
//          configEntrypoint = match[1].trim();
//        }
//      }
//
//      setFileTree(fileList);
//      setEntryFile(configEntrypoint || candidates[0] || '');
//    } catch (err) {
//      console.error("Erro ao ler ZIP no frontend:", err);
//      setFileTree([]);
//      setEntryFile('');
//    } finally {
//      setLoadingTree(false);
//    }
//
//    event.target.value = "";
//  };
//    return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center text-center">
//              {selectedFile ? (
//                <>
//                  <img
//                    alt="Arquivo selecionado"
//                    src="/assets/pages/upload/file-1.svg"
//                    width={128}
//                    height={128}
//                    className="mb-2"
//                  />
//                  <p className="text-sm text-white font-medium">{selectedFile.name}</p>
//                  <p className="text-xs text-secondary">
//                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
//                  </p>
//                </>
//              ) : (
//                <>
//                  <img
//                    alt="Área de upload"
//                    src="/assets/pages/upload/file-upload.svg"
//                    width={256}
//                    height={155}
//                  />
//                  <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                  <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                </>
//              )}
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="cursor-pointer bg-background text-primary text-sm font-medium rounded-md px-4 py-2 shadow-border hover:bg-virtus-600"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Árvore de arquivos + seleção de entrypoint */}
//        <div className="motion-opacity-in-0 flex h-100 flex-col items-center justify-center w-full">
//          {loadingTree ? (
//            <p className="text-sm text-secondary">Carregando arquivos...</p>
//          ) : fileTree.length > 0 ? (
//            <>
//              <ul className="text-sm text-left text-secondary space-y-1 max-h-[230px] overflow-y-auto w-full px-2">
//                {fileTree.map((file, i) => (
//                  <li key={i} className="truncate">{file}</li>
//                ))}
//              </ul>
//
//              <div className="mt-4 w-full px-2">
//                <label className="block text-sm font-medium text-white mb-1">
//                  Comando de inicialização
//                </label>
//                <select
//                  value={entryFile}
//                  onChange={(e) => setEntryFile(e.target.value)}
//                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-white"
//                >
//                  {fileTree
//                    .filter((f) =>
//                      entrypointPatterns.some((p) => f.toLowerCase().endsWith(p.toLowerCase()))
//                    )
//                    .map((file, i) => (
//                      <option key={i} value={file}>
//                        {file}
//                      </option>
//                    ))}
//                </select>
//              </div>
//            </>
//          ) : (
//            <p className="text-center text-secondary text-sm">
//              Selecione um arquivo para visualizar sua árvore de arquivos.
//            </p>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//}

//'use client';
//
//import { useRef, useState } from 'react';
//import JSZip from 'jszip';
//
//type Props = {
//  onFileSelect?: (file: File) => void;
//};
//
//export default function ZipUploadArea({ onFileSelect }: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//  const [selectedFile, setSelectedFile] = useState<File | null>(null);
//  const [fileTree, setFileTree] = useState<string[]>([]);
//  const [loadingTree, setLoadingTree] = useState(false);
//  const entrypointPatterns = [
//    "index.js", "main.js", "app.js", "server.js", "start.js", "init.js",
//    "index.ts", "main.ts", "app.ts", "server.ts", "start.ts", "init.ts",
//    "index.py", "main.py", "app.py", "server.py", "run.py", "start.py", "init.py", "manage.py",
//    "index.go", "main.go", "app.go", "server.go", "start.go", "init.go",
//    "index.rs", "main.rs", "lib.rs", "app.rs", "server.rs",
//    "index.php", "main.php", "app.php", "server.php", "start.php", "init.php",
//    "index.cs", "main.cs", "program.cs", "app.cs", "startup.cs",
//    "index.ex", "main.ex", "app.ex", "server.ex", "start.ex", "init.ex",
//    "index.java", "Main.java", "App.java", "Application.java", "Start.java", "Server.java", "JMusicBot.java", "Launcher.java",
//    "index.kt", "Main.kt", "App.kt", "Application.kt", "Start.kt", "Server.kt",
//    "index.lua", "main.lua", "init.lua", "app.lua", "server.lua", "start.lua",
//    "index.html", "main.html", "app.html", "start.html", "init.html",
//    "main.rb", "app.rb", "server.rb", "start.rb", "init.rb",
//    "main.swift", "App.swift", "Start.swift",
//    "main.c", "app.c", "server.c", "main.cpp", "app.cpp", "server.cpp",
//    "start.sh", "run.sh", "deploy.sh", "init.sh",
//    "vite.config.ts", "nuxt.config.ts", "nest-cli.json",
//    "index.mjs", "main.mjs", "app.mjs", "server.mjs",
//  ];
//
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//    const file = event.target.files?.[0];
//    if (!file) return;
//
//    setSelectedFile(file);
//    if (onFileSelect) onFileSelect(file);
//
//    setLoadingTree(true);
//
//    try {
//      const zip = await JSZip.loadAsync(file);
//      const fileList: string[] = [];
//
//      zip.forEach((relativePath) => {
//        fileList.push(relativePath);
//      });
//
//      setFileTree(fileList);
//    } catch (err) {
//      console.error("Erro ao ler ZIP no frontend:", err);
//      setFileTree([]);
//    } finally {
//      setLoadingTree(false);
//    }
//
//    event.target.value = "";
//  };
//
//  return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center text-center">
//              {selectedFile ? (
//                <>
//                  <img
//                    alt="Arquivo selecionado"
//                    src="/assets/pages/upload/file-1.svg"
//                    width={128}
//                    height={128}
//                    className="mb-2"
//                  />
//                  <p className="text-sm text-white font-medium">{selectedFile.name}</p>
//                  <p className="text-xs text-secondary">
//                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
//                  </p>
//                </>
//              ) : (
//                <>
//                  <img
//                    alt="Área de upload"
//                    src="/assets/pages/upload/file-upload.svg"
//                    width={256}
//                    height={155}
//                  />
//                  <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                  <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                </>
//              )}
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Árvore de arquivos */}
//        <div className="motion-opacity-in-0 flex h-100 items-center justify-center">
//          {loadingTree ? (
//            <p className="text-sm text-secondary">Carregando arquivos...</p>
//          ) : fileTree.length > 0 ? (
//            <ul className="text-sm text-left text-secondary space-y-1 max-h-[230px] overflow-y-auto">
//              {fileTree.map((file, i) => (
//                <li key={i} className="truncate">{file}</li>
//              ))}
//            </ul>
//          ) : (
//            <p className="text-center text-secondary text-sm">
//              Selecione um arquivo para visualizar sua árvore de arquivos.
//            </p>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//}

//frontend/src/components/buttons/ZipUploadArea.tsx

//'use client';
//
//import { useRef, useState } from 'react';
//import JSZip from 'jszip';
//
//type Props = {
//  onFileSelect?: (file: File) => void;
//};
//
//export default function ZipUploadArea({ onFileSelect }: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//  const [selectedFile, setSelectedFile] = useState<File | null>(null);
//  const [fileTree, setFileTree] = useState<string[]>([]);
//  const [loadingTree, setLoadingTree] = useState(false);
//
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//    const file = event.target.files?.[0];
//    if (!file) return;
//
//    setSelectedFile(file);
//    if (onFileSelect) onFileSelect(file);
//
//    setLoadingTree(true);
//
//    try {
//      const zip = await JSZip.loadAsync(file);
//      const fileList: string[] = [];
//
//      zip.forEach((relativePath) => {
//        fileList.push(relativePath);
//      });
//
//      setFileTree(fileList);
//    } catch (err) {
//      console.error("Erro ao ler ZIP no frontend:", err);
//      setFileTree([]);
//    } finally {
//      setLoadingTree(false);
//    }
//
//    event.target.value = "";
//  };
//
//  return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center text-center">
//              {selectedFile ? (
//                <>
//                  <img
//                    alt="Arquivo selecionado"
//                    src="/assets/pages/upload/file-1.svg"
//                    width={128}
//                    height={128}
//                    className="mb-2"
//                  />
//                  <p className="text-sm text-white font-medium">{selectedFile.name}</p>
//                  <p className="text-xs text-secondary">
//                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
//                  </p>
//                </>
//              ) : (
//                <>
//                  <img
//                    alt="Área de upload"
//                    src="/assets/pages/upload/file-upload.svg"
//                    width={256}
//                    height={155}
//                  />
//                  <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                  <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                </>
//              )}
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Árvore de arquivos */}
//        <div className="motion-opacity-in-0 flex h-100 items-center justify-center">
//          {loadingTree ? (
//            <p className="text-sm text-secondary">Carregando arquivos...</p>
//          ) : fileTree.length > 0 ? (
//            <ul className="text-sm text-left text-secondary space-y-1 max-h-[230px] overflow-y-auto">
//              {fileTree.map((file, i) => (
//                <li key={i} className="truncate">{file}</li>
//              ))}
//            </ul>
//          ) : (
//            <p className="text-center text-secondary text-sm">
//              Selecione um arquivo para visualizar sua árvore de arquivos.
//            </p>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//}

//'use client';
//
//import { useRef, useState } from 'react';
//
//type Props = {
//  onFileSelect?: (file: File) => void;
//};
//
//export default function ZipUploadArea({ onFileSelect }: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//  const [selectedFile, setSelectedFile] = useState<File | null>(null);
//  const [fileTree, setFileTree] = useState<string[]>([]);
//  const [loadingTree, setLoadingTree] = useState(false);
//
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//    const file = event.target.files?.[0];
//    if (!file) return;
//
//    setSelectedFile(file);
//    if (onFileSelect) onFileSelect(file);
//
//    setLoadingTree(true); // ⬅️ Inicia o loading
//
//    const formData = new FormData();
//    formData.append("file", file);
//
//    try {
//      const res = await fetch("/api/inspect-zip", {
//        method: "POST",
//        body: formData,
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result;
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//        setFileTree(result.files || []);
//      } else {
//        const raw = await res.text();
//        console.error("Resposta inesperada:", raw);
//        setFileTree([]);
//      }
//    } catch (err) {
//      console.error("Erro ao inspecionar zip:", err);
//      setFileTree([]);
//    } finally {
//      setLoadingTree(false); // ⬅️ Finaliza o loading
//    }
//
//    event.target.value = "";
//  };
//
//  return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center text-center">
//              {selectedFile ? (
//                <>
//                  <img
//                    alt="Arquivo selecionado"
//                    src="/assets/pages/file-1.svg"
//                    width={128}
//                    height={128}
//                    className="mb-2"
//                  />
//                  <p className="text-sm text-white font-medium">{selectedFile.name}</p>
//                  <p className="text-xs text-secondary">
//                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
//                  </p>
//                </>
//              ) : (
//                <>
//                  <img
//                    alt="Área de upload"
//                    src="/assets/pages/upload/file-upload.svg"
//                    width={256}
//                    height={155}
//                  />
//                  <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                  <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                </>
//              )}
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Árvore de arquivos */}
//        <div className="motion-opacity-in-0 flex h-100 items-center justify-center">
//          {loadingTree ? (
//            <p className="text-sm text-secondary">Carregando arquivos...</p>
//          ) : fileTree.length > 0 ? (
//            <ul className="text-sm text-left text-secondary space-y-1 max-h-[230px] overflow-y-auto">
//              {fileTree.map((file, i) => (
//                <li key={i} className="truncate">{file}</li>
//              ))}
//            </ul>
//          ) : (
//            <p className="text-center text-secondary text-sm">
//              Selecione um arquivo para visualizar sua árvore de arquivos.
//            </p>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//}

//frontend/src/components/buttons/ZipUploadArea.tsx

//'use client';
//
//import { useRef, useState } from 'react';
//
//type Props = {
//  onFileSelect?: (file: File) => void;
//};
//
//export default function ZipUploadArea({ onFileSelect }: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//  const [selectedFile, setSelectedFile] = useState<File | null>(null);
//  const [fileTree, setFileTree] = useState<string[]>([]);
//
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//    const file = event.target.files?.[0];
//    if (!file) return;
//
//    setSelectedFile(file);
//    if (onFileSelect) onFileSelect(file);
//
//    // 🔍 Inspeciona o conteúdo do ZIP antes do deploy
//    const formData = new FormData();
//    formData.append("file", file);
//
//    try {
//      const res = await fetch("/api/inspect-zip", {
//        method: "POST",
//        body: formData,
//      });
//
//      const result = await res.json();
//      setFileTree(result.files || []);
//    } catch (err) {
//      console.error("Erro ao inspecionar zip:", err);
//      setFileTree([]);
//    }
//
//    event.target.value = "";
//  };
//
//  return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center text-center">
//              {selectedFile ? (
//                <>
//                  <img
//                    alt="Arquivo selecionado"
//                    src="/assets/file-1.svg"
//                    width={128}
//                    height={128}
//                    className="mb-2"
//                  />
//                  <p className="text-sm text-white font-medium">{selectedFile.name}</p>
//                  <p className="text-xs text-secondary">
//                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
//                  </p>
//                </>
//              ) : (
//                <>
//                  <img
//                    alt="Área de upload"
//                    src="/assets/pages/upload/file-upload.svg"
//                    width={256}
//                    height={155}
//                  />
//                  <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                  <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                </>
//              )}
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Árvore de arquivos */}
//        <div className="motion-opacity-in-0 flex h-100 items-center justify-center">
//          {fileTree.length > 0 ? (
//            <ul className="text-sm text-left text-secondary space-y-1 max-h-[230px] overflow-y-auto">
//              {fileTree.map((file, i) => (
//                <li key={i} className="truncate">{file}</li>
//              ))}
//            </ul>
//          ) : (
//            <p className="text-center text-secondary text-sm">
//              Selecione um arquivo para visualizar sua árvore de arquivos.
//            </p>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//}

//'use client';
//
//import { useRef } from 'react';
//
//type Props = {
//  onFileSelect?: (file: File) => void;
//};
//
//export default function ZipUploadArea({ onFileSelect }: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//    const file = event.target.files?.[0];
//    if (!file) return;
//
//    if (onFileSelect) {
//      onFileSelect(file);
//    }
//
//    event.target.value = "";
//  };
//
//  return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center">
//              <img
//                alt="File Upload"
//                draggable={false}
//                loading="lazy"
//                width={256}
//                height={155}
//                decoding="async"
//                src="/assets/pages/upload/file-upload.svg"
//                style={{ color: 'transparent' }}
//              />
//              <div className="mt-4 flex flex-col items-center text-center">
//                <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//              </div>
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        <div className="motion-opacity-in-0 flex h-100 items-center justify-center">
//          <p className="text-center text-secondary text-sm">
//            Selecione um arquivo para visualizar sua árvore de arquivos.
//          </p>
//        </div>
//      </div>
//    </div>
//  );
//}

//type Props = {
//  onUploadResult?: (result: { envDetected: boolean }) => void;
//};
//
//export default function ZipUploadArea({ onUploadResult }: Props) {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//    const file = event.target.files?.[0];
//    if (!file) return;
//
//    const formData = new FormData();
//    formData.append("file", file);
//
//    try {
//      const res = await fetch("/api/upload", {
//        method: "POST",
//        body: formData,
//      });
//
//      const result = await res.json();
//
//      if (onUploadResult) {
//        onUploadResult(result);
//      }
//    } catch (err) {
//      console.error("Erro ao enviar arquivo:", err);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            onChange={handleFileSelect}
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center">
//              <img
//                alt="File Upload"
//                draggable={false}
//                loading="lazy"
//                width={256}
//                height={155}
//                decoding="async"
//                src="/assets/pages/upload/file-upload.svg"
//                style={{ color: 'transparent' }}
//              />
//              <div className="mt-4 flex flex-col items-center text-center">
//                <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//              </div>
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Placeholder da árvore de arquivos */}
//        <div className="motion-opacity-in-0 flex h-100 items-center justify-center">
//          <p className="text-center text-secondary text-sm">
//            Selecione um arquivo para visualizar sua árvore de arquivos.
//          </p>
//        </div>
//      </div>
//    </div>
//  );
//}

//frontend/src/components/buttons/ZipUploadArea.tsx

//'use client';
//
//import { useRef } from 'react';
//
//export default function ZipUploadArea() {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0 && fileInputRef.current) {
//      // Cria um DataTransfer para simular seleção
//      const dataTransfer = new DataTransfer();
//      Array.from(files).forEach(file => dataTransfer.items.add(file));
//      fileInputRef.current.files = dataTransfer.files;
//
//      // Dispara evento de mudança manualmente
//      const changeEvent = new Event('change', { bubbles: true });
//      fileInputRef.current.dispatchEvent(changeEvent);
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            ref={fileInputRef}
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//
//          <div
//            role="presentation"
//            tabIndex={0}
//            onClick={handleClick}
//            onDrop={handleDrop}
//            onDragOver={handleDragOver}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//          >
//            <div className="flex size-full flex-col items-center justify-center">
//              <img
//                alt="File Upload"
//                draggable={false}
//                loading="lazy"
//                width={256}
//                height={155}
//                decoding="async"
//                src="/assets/pages/upload/file-upload.svg"
//                style={{ color: 'transparent' }}
//              />
//              <div className="mt-4 flex flex-col items-center text-center">
//                <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//              </div>
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Placeholder da árvore de arquivos */}
//        <div className="motion-opacity-in-0 flex h-100 items-center justify-center">
//          <p className="text-center text-secondary text-sm">
//            Selecione um arquivo para visualizar sua árvore de arquivos.
//          </p>
//        </div>
//      </div>
//    </div>
//  );
//}

//import { useRef } from 'react';
//
//export default function ZipUploadArea() {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0) {
//      if (fileInputRef.current) {
//        fileInputRef.current.files = files;
//      }
//      // Aqui você pode chamar a função de upload ou atualizar o estado
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  return (
//    <div className="px-6 md:h-100" data-slot="card-content">
//      <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//        {/* Área de upload */}
//        <div className="flex select-none flex-col gap-1.5">
//          <input
//            accept="application/zip,.zip"
//            multiple
//            tabIndex={-1}
//            type="file"
//            style={{
//              border: 0,
//              clip: 'rect(0px, 0px, 0px, 0px)',
//              clipPath: 'inset(50%)',
//              height: '1px',
//              margin: '0px -1px -1px 0px',
//              overflow: 'hidden',
//              padding: 0,
//              position: 'absolute',
//              width: '1px',
//              whiteSpace: 'nowrap',
//            }}
//          />
//          <div
//            role="presentation"
//            tabIndex={0}
//            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer data-[dragging=true]:border-blue-500"
//            data-dragging="false"
//          >
//            <div className="flex size-full flex-col items-center justify-center">
//              <img
//                alt="File Upload"
//                draggable={false}
//                loading="lazy"
//                width={256}
//                height={155}
//                decoding="async"
//                src="/assets/pages/upload/file-upload.svg"
//                style={{ color: 'transparent' }}
//              />
//              <div className="mt-4 flex flex-col items-center text-center">
//                <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//              </div>
//              <div className="mt-6">
//                <button
//                  type="button"
//                  role="button"
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//                >
//                  Selecione seu arquivo
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Placeholder da árvore de arquivos */}
//        <div className="motion-opacity-in-0 flex h-100 items-center justify-center">
//          <p className="text-center text-secondary text-sm">
//            Selecione um arquivo para visualizar sua árvore de arquivos.
//          </p>
//        </div>
//      </div>
//    </div>
//  );
//}

//import { useRef } from 'react';
//
//export default function ZipUploadArea() {
//  const fileInputRef = useRef<HTMLInputElement>(null);
//
//  const handleClick = () => {
//    fileInputRef.current?.click();
//  };
//
//  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//    const files = event.dataTransfer.files;
//    if (files.length > 0) {
//      if (fileInputRef.current) {
//        fileInputRef.current.files = files;
//      }
//      // Aqui você pode chamar a função de upload ou atualizar o estado
//    }
//  };
//
//  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//    event.preventDefault();
//  };
//
//  return (
//    <div className="flex select-none flex-col gap-1.5">
//      <input
//        ref={fileInputRef}
//        type="file"
//        accept="application/zip,.zip"
//        multiple
//        tabIndex={-1}
//        style={{
//          border: 0,
//          clip: 'rect(0px, 0px, 0px, 0px)',
//          clipPath: 'inset(50%)',
//          height: '1px',
//          margin: '0px -1px -1px 0px',
//          overflow: 'hidden',
//          padding: 0,
//          position: 'absolute',
//          width: '1px',
//          whiteSpace: 'nowrap',
//        }}
//      />
//
//      <div
//        role="presentation"
//        tabIndex={0}
//        onClick={handleClick}
//        onDrop={handleDrop}
//        onDragOver={handleDragOver}
//        className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//      >
//        <div className="flex size-full flex-col items-center justify-center">
//          <img
//            alt="File Upload"
//            draggable={false}
//            loading="lazy"
//            width={256}
//            height={155}
//            src="/assets/pages/upload/file-upload.svg"
//            style={{ color: 'transparent' }}
//          />
//          <div className="mt-4 flex flex-col items-center text-center">
//            <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//            <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//          </div>
//          <div className="mt-6">
//            <button
//              type="button"
//              onClick={handleClick}
//              className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//            >
//              Selecione seu arquivo
//            </button>
//          </div>
//        </div>
//      </div>
//    </div>
//  );
//}