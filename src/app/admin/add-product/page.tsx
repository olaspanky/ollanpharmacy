"use client";

import AddProductForm from "../../components/AddProductForm";
import Navbar from "../../components/Navbar2";

export default function AddProductPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
           <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AddProductForm />
      </div>
    </div>
  );
}