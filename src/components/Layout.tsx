import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  currentPage?: string;
}

export function Layout({ currentPage }: LayoutProps) {
  return (
    <div className="flex h-screen bg-secondary">
      <Sidebar currentPage={currentPage} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
