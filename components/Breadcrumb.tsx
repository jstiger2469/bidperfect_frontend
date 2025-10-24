import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export default function Breadcrumb({ items, showHome = true, className = "" }: BreadcrumbProps) {
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {showHome && (
        <>
          <button
            onClick={() => handleNavigation('/')}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <HomeIcon className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </button>
          {items.length > 0 && (
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          )}
        </>
      )}
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {item.href && !item.current ? (
            <button
              onClick={() => handleNavigation(item.href!)}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              {item.label}
            </button>
          ) : (
            <span className={item.current ? "text-gray-900 font-medium" : "text-gray-500"}>
              {item.label}
            </span>
          )}
          
          {index < items.length - 1 && (
            <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
          )}
        </div>
      ))}
    </nav>
  );
} 