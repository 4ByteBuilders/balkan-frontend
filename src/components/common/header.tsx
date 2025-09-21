import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Menu,
  X,
  Search,
  LogOut,
  User,
  Settings,
  CircleQuestionMark,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthGate } from "../auth/auth_gate";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = ({ children }: { children: React.ReactNode }) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const { isAuthenticated, logout } = useAuth();

  const handleToggleModal = () => {
    setOpenModal((prev) => !prev);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="bg-white min-h-screen">
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center justify-between h-16 border-b px-6 py-3 sticky top-0 z-50 bg-white"
      >
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.03 }} className="flex items-center">
          <img
            src="/logo.png"
            alt="Bault"
            loading="lazy"
            className="w-24 cursor-pointer"
          />
        </motion.div>

        {/* Search - Medium Screen and Up */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden md:flex items-center relative w-72 lg:w-96"
          >
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 rounded-full border-gray-200 bg-gray-50 focus-visible:ring-1 focus-visible:ring-gray-300"
            />
          </motion.div>
        )}

        {/* Buttons - Medium Screen and Up */}
        {isAuthenticated ? (
          //TODO: Replace with user avatar and dropdown
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="items-center space-x-2 hidden md:flex"
          >
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="hover:scale-105 transition-transform cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Button variant="ghost" className="">
                    <User className="text-lg" />
                    Profile
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button variant="ghost" className="">
                    <Settings className="text-lg" />
                    Settings
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button variant="ghost" className="">
                    <CircleQuestionMark className="text-lg" />
                    FAQ
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Button
                    onClick={logout}
                    variant="destructive"
                    className="w-full"
                  >
                    <LogOut className="text-white" />
                    Logout
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="items-center space-x-2 hidden md:flex"
          >
            <Button
              onClick={handleToggleModal}
              className="rounded-full px-4 shadow-sm hover:shadow transition-all"
            >
              Login
            </Button>
          </motion.div>
        )}

        {/* Mobile Menu Button */}
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:hidden"
        >
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {showMenu ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-16 left-0 right-0 bg-white border-b shadow-sm md:hidden overflow-hidden"
            >
              <div className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 rounded-full border-gray-200 bg-gray-50 focus-visible:ring-1 focus-visible:ring-gray-300"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={handleToggleModal}
                    className="rounded-full px-4 shadow-sm hover:shadow transition-all"
                  >
                    Login
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {children}
      {/* Login Modal */}
      {openModal && <AuthGate onClose={handleToggleModal} />}
    </div>
  );
};
