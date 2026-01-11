"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Product } from "../types";
import { ShoppingBag, Check } from "lucide-react";

export default function AddToCartBtn({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isAdded}
      className={`
        flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg w-full
        ${isAdded 
          ? "bg-green-500 text-white scale-95" 
          : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-95"
        }
      `}
    >
      {isAdded ? (
        <>
          <Check size={16} /> Added
        </>
      ) : (
        <>
          <ShoppingBag size={16} /> Add to Cart
        </>
      )}
    </button>
  );
}