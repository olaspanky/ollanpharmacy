"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Search, Heart, ShoppingBag, ChevronDown, Menu, CircleX, Truck, Smartphone, User, LogOut } from 'lucide-react';
import logo from "../../../public/ollogo.svg";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext"; // Import useAuth hook
import { useRouter } from "next/navigation"; // Import useRouter for navigation

const navLinks = [
  { name: "Home", href: "/" },
];

const Navbar = ({ links = navLinks }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth(); // Access user and logout from AuthContext
  const router = useRouter();

  console.log("user is", user)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout(); // Call logout from AuthContext
    setIsMobileMenuOpen(false); // Close mobile menu if open
    router.push("/pages/signin"); // Redirect to signin page
  };

  return (
    <main className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="p-2 rounded-lg mr-3">
                <Image src={logo} alt="Ollan Logo" width={80} height={80} className="lg:w-20 w-12" />
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 w-full max-w-md">
            <select className="bg-transparent border-none outline-none text-gray-600 text-sm">
              <option>All Categories</option>
              <option>Anti-malaria</option>
              <option>Vitamins and Supplements</option>
              <option>Pain reliever</option>
              <option>Anti Biotics</option>
              <option>Anti-Asthma</option>
              <option>Baby care</option>
            </select>
            <div className="h-4 w-px bg-gray-300 mx-3"></div>
            <input
              type="text"
              placeholder="Search medicine, medical products"
              className="bg-transparent border-none outline-none flex-1 text-sm"
            />
            <button className="bg-red-500 text-white p-2 rounded-full ml-2">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Heart className="w-6 h-6 text-gray-600 cursor-pointer" />
            <ShoppingBag className="w-6 h-6 text-gray-600 cursor-pointer" />
            <div className="relative group">
              <div className="flex items-center cursor-pointer">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                  {user ? (
                    <span className="text-white font-medium">
                      {user.name ? user.name[0].toUpperCase() : <User className="w-5 h-5" />}
                    </span>
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <span className="text-gray-600 font-medium">
                  {user ? user.name || "Profile" : "Account"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-600 ml-1" />
              </div>
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block z-10">
                <ul className="py-2">
                  {user ? (
                    <>
                      <li>
                        <Link
                          href="/pages/profile"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/admin/add-product"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                        >
                          Add item
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          href="/pages/signin"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                        >
                          Sign In
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/pages/signup"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                        >
                          Sign Up
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? (
                <CircleX className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-200">
            <ul className="flex flex-col items-left py-4">
              {links.map((link) => (
                <li key={link.name} className="py-2">
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-red-500 font-medium text-base"
                    onClick={toggleMobileMenu}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {/* Mobile Icons */}
              <li className="flex items-center space-x-4 py-2">
                <Heart className="w-6 h-6 text-gray-600 cursor-pointer" />
                <ShoppingBag className="w-6 h-6 text-gray-600 cursor-pointer" />
              </li>
              {/* Mobile User Menu */}
              <li className="py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                    {user ? (
                      <span className="text-white font-medium">
                        {user.name ? user.name[0].toUpperCase() : <User className="w-5 h-5" />}
                      </span>
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <span className="text-gray-600 font-medium">
                    {user ? user.name || "Profile" : "Account"}
                  </span>
                </div>
                <ul className="pl-4 mt-2">
                  {user ? (
                    <>
                      <li>
                        <Link
                          href="/pages/profile"
                          className="block py-2 text-gray-600 hover:text-red-500"
                          onClick={toggleMobileMenu}
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left py-2 text-gray-600 hover:text-red-500 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          href="/pages/signin"
                          className="block py-2 text-gray-600 hover:text-red-500"
                          onClick={toggleMobileMenu}
                        >
                          SignIn
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/pages/signup"
                          className="block py-2 text-gray-600 hover:text-red-500"
                          onClick={toggleMobileMenu}
                        >
                          SignUp
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </main>
  );
};

export default Navbar;