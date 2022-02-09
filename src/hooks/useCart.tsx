import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updateProductCart = [...cart];
      const productExistsInCart = updateProductCart.find(product => product.id === productId);
      const getProductStock = await api.get(`/stock/${productId}`).then(response => response.data);
      const newAmountProduct = productExistsInCart ? productExistsInCart.amount + 1 : 0;

      if (newAmountProduct > getProductStock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;

      } else if (productExistsInCart && newAmountProduct <= getProductStock.amount) {
        productExistsInCart.amount = newAmountProduct;

      } else {
        const createProductInCart = await api.get(`/products/${productId}`).then(response => response.data);
        updateProductCart.push({ ...createProductInCart, amount: 1 })
      }

      setCart(updateProductCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateProductCart))

    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updateProductCart = [...cart];
      const newProductsCart = updateProductCart.filter(product => product.id !== productId);

      setCart(newProductsCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newProductsCart))

    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
