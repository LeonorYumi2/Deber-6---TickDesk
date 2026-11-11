import { Routes, Route } from 'react-router-dom';
import { Header } from '@/widgets/header/ui/header';
import { Footer } from '@/widgets/footer/ui/footer';
import { HomePage } from '@/pages/home';
import { ConfirmPage } from '@/pages/confirm';
import { ResetPasswordPage } from '@/pages/reset-password';
import { NotFoundPage } from '@/pages/not-found/ui/not-found-page';

export function AppRouter() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Header />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'var(--space-4) 0 var(--space-6)',
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/confirm" element={<ConfirmPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
