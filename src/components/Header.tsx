import { useRef } from 'react';

interface HeaderProps {
  scenarioName: string;
  onNew: () => void;
  onDuplicate: () => void;
  onImport: (file: File) => void;
  onExport: () => void;
  onPrint: () => void;
  onSettings: () => void;
}

export function Header({
  scenarioName,
  onNew,
  onDuplicate,
  onImport,
  onExport,
  onPrint,
  onSettings,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="topbar">
      <div className="brand-cluster">
        <strong className="brand">Atlantic Link Imports</strong>
        <span className="topbar-divider" />
        <span className="product-name">Simulador de importación</span>
        <span className="scenario-name">{scenarioName}</span>
        <span className="saved-badge">● Guardado localmente</span>
      </div>

      <div className="topbar-actions">
        <button type="button" onClick={onNew}>＋ Nueva simulación</button>
        <button type="button" onClick={onDuplicate}>⧉ Duplicar</button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>⇧ Importar JSON</button>
        <button type="button" onClick={onExport}>⇩ Exportar JSON</button>
        <button type="button" onClick={onPrint}>▣ Imprimir</button>
        <button type="button" onClick={onSettings}>⚙ Configuración</button>
      </div>

      <input
        ref={fileInputRef}
        hidden
        accept="application/json,.json"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onImport(file);
          event.currentTarget.value = '';
        }}
      />
    </header>
  );
}
