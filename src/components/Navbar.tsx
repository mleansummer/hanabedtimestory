import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Library, UserCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = user ? [
    {
      to: '/my-stories',
      icon: <Library className="h-5 w-5 text-boho-stone" />,
      label: 'My Stories'
    },
    {
      to: '/profile',
      icon: <UserCircle className="h-5 w-5 text-boho-stone" />,
      label: 'Profile'
    }
  ] : [];

  const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
        isActive(to)
          ? 'text-[#3a4f97] bg-white/50'
          : 'text-boho-stone hover:text-[#3a4f97] hover:bg-white/30'
      }`}
      onClick={() => setIsMenuOpen(false)}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Link>
  );

  return (
    <div className="sticky top-0 z-50 backdrop-blur-sm border-b border-white/10">
      <nav className="max-w-7xl mx-auto">
        <div className="flex justify-between h-16 px-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-boho font-bold text-boho-stone">
                Bedtime Stories
              </span>
            </Link>
          </div>

          {user && (
            <>
              {/* Desktop navigation */}
              <div className="hidden md:flex items-center space-x-4">
                {navLinks.map((link) => (
                  <NavLink key={link.to} {...link} />
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => signOut()}
                  className="bg-white/50 hover:bg-white/70"
                >
                  Sign Out
                </Button>
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md text-boho-stone hover:text-[#3a4f97] hover:bg-white/30 focus:outline-none"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6 text-boho-stone" />
                  ) : (
                    <Menu className="h-6 w-6 text-boho-stone" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {isMenuOpen && user && (
          <div className="md:hidden border-t border-white/10 py-2 px-4">
            <div className="space-y-1 pb-3">
              {navLinks.map((link) => (
                <NavLink key={link.to} {...link} />
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut();
                }}
                className="w-full mt-2 justify-center bg-white/50 hover:bg-white/70"
              >
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navbar;