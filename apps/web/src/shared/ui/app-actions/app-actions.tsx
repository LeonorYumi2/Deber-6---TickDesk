import { useState } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { env } from '@/shared/config/env';
import { Button } from '@/shared/ui/button';

interface AppActionsProps {
  /**
   * Optional helper text shown underneath
   */
  helperText?: string;
  /**
   * Layout orientation: 'stacked' (default) or 'inline'
   */
  layout?: 'stacked' | 'inline';
}

export function AppActions({
  helperText,
  layout = 'stacked',
}: AppActionsProps) {
  const [attemptedOpen, setAttemptedOpen] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const handleOpenApp = () => {
    setAttemptedOpen(true);
    setShowFallback(false);

    const startTime = Date.now();
    window.location.href = env.appScheme;

    window.setTimeout(() => {
      const elapsed = Date.now() - startTime;
      if (!document.hidden && elapsed < 3500) {
        setShowFallback(true);
      }
    }, 2200);
  };

  const handleDownloadApk = () => {
    window.open(env.apkDownloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        marginTop: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: layout === 'inline' ? 'row' : 'column',
          gap: '10px',
          width: '100%',
        }}
      >
        <Button
          variant="petrol"
          size="md"
          fullWidth
          icon={<Smartphone size={16} />}
          onClick={handleOpenApp}
        >
          Abrir aplicación TickDesk
        </Button>

        <Button
          variant="outline"
          size="md"
          fullWidth
          icon={<Download size={15} />}
          onClick={handleDownloadApk}
        >
          Descargar APK
        </Button>
      </div>

      {attemptedOpen && showFallback && (
        <div
          style={{
            fontSize: 'var(--font-xs)',
            color: 'var(--color-coral)',
            textAlign: 'center',
            lineHeight: 1.4,
            padding: '6px 8px',
          }}
        >
          ¿No se abrió la app? Comprueba si está instalada en tu dispositivo o{' '}
          <a
            href={env.apkDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, textDecoration: 'underline' }}
          >
            descarga el APK
          </a>
          .
        </div>
      )}

      {helperText && !showFallback && (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-subtle)',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
