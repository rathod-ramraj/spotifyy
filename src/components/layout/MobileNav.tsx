import { Home, Search, Library } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const MobileNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Library, label: 'Your Library', path: '/library' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-spotify-black border-t border-border px-8 py-4 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1"
          >
            <item.icon 
              className={cn(
                "h-6 w-6 transition-colors",
                isActive(item.path) ? "text-foreground" : "text-muted-foreground"
              )} 
            />
            <span 
              className={cn(
                "text-xs font-semibold transition-colors",
                isActive(item.path) ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
