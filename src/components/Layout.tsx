import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  currentPage?: string;
}

export function Layout({ currentPage }: LayoutProps) {
  return (
    <div className="flex h-screen bg-secondary">
      <Sidebar currentPage={currentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
