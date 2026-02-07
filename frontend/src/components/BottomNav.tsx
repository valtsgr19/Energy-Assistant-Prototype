import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'daily-assistant',
    label: 'Daily Assistant',
    path: '/daily-assistant',
    icon: '📊',
  },
  {
    id: 'insights',
    label: 'Energy Insights',
    path: '/insights',
    icon: '💡',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: '⚙️',
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (item: NavItem) => {
    if (item.disabled) return;
    navigate(item.path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const disabled = item.disabled;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                disabled={disabled}
                className={`
                  flex flex-col items-center justify-center
                  flex-1 h-full
                  transition-colors duration-200
                  ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                  ${active && !disabled ? 'text-blue-600' : 'text-gray-600'}
                  ${!active && !disabled ? 'hover:text-blue-500 hover:bg-gray-50' : ''}
                `}
                aria-label={`${item.label}${active ? ' (current page)' : ''}${disabled ? ' (coming soon)' : ''}`}
                aria-current={active ? 'page' : undefined}
                aria-disabled={disabled}
              >
                <span className="text-2xl mb-1" aria-hidden="true">{item.icon}</span>
                <span className={`
                  text-xs font-medium
                  ${active && !disabled ? 'text-blue-600' : 'text-gray-600'}
                `}>
                  {item.label}
                </span>
                {disabled && (
                  <span className="text-[10px] text-gray-400 mt-0.5">Coming Soon</span>
                )}
                {active && !disabled && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
