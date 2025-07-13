"use client";

import { useRouter } from "next/navigation";
import { Package, Bell, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";
import logo from "../../../public/ollogo.svg";

export default function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/pages/admin-signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Determine dashboard title and description based on role
  const dashboardTitle = user?.role === "rider" ? "Ollan Rider Dashboard" : "Ollan Seller Dashboard";
  const dashboardDescription =
    user?.role === "rider" ? "Manage your deliveries efficiently" : "Manage your orders efficiently";

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-lg transition-transform hover:scale-105">
              <Image
                src={logo}
                alt="Ollan Logo"
                width={80}
                height={80}
                className="lg:w-20 w-12 h-auto"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {dashboardTitle}
              </h1>
              <p className="text-slate-500 text-sm">{dashboardDescription}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Navigation Buttons based on user role */}
            {user?.role === "admin" ? (
              <>
                <button
                  onClick={() => router.push("/admin/seller")}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Seller Dashboard
                </button>
                <button
                  onClick={() => router.push("/admin/add-product")}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Add Products
                </button>
                <button
                  onClick={() => router.push("/admin/update-product")}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Update Product
                </button>
              </>
            ) : user?.role === "rider" ? (
              <button
                onClick={() => router.push("/admin/rider")}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Rider Dashboard
              </button>
            ) : null}
            {/* Notification Button */}
            <button className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}