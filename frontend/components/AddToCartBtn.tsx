"use client";

import { useCart } from "../context/CartContext";
import { Product } from "../types";

export default function AddToCartBtn({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(product)}
      className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition active:scale-95"
    >
      Add +
    </button>
  );
}