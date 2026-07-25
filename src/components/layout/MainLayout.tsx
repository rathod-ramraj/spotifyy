import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import NowPlayingBar from './NowPlayingBar';
import MobileNav from './MobileNav';

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#000000] text-foreground font-sans overflow-hidden">
      {/* Full-Width Top Header */}
      <Header />

      {/* Dual-Pane Body Split */}
      <div className="flex flex-1 gap-2 p-2 pt-0 pb-[92px] md:pb-[94px] overflow-hidden min-h-0">
        {/* Sidebar - Collapsible Left Pane */}
        <div className="hidden md:block h-full shrink-0">
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>
        
        {/* Main Content Pane inside rounded dark surface bg-[#121212] */}
        <main className="flex-1 bg-[#121212] rounded-lg overflow-hidden min-w-0 relative flex flex-col">
          <Outlet />
        </main>
      </div>
      
      {/* Fixed Bottom Now-Playing Player */}
      <NowPlayingBar />
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default MainLayout;
