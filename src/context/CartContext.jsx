import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Fetch cart when user changes
    useEffect(() => {
        if (user?.id) {
            fetchCart();
        } else if (!user) {
            setCart([]); // Clear cart or load from local storage if implementing guest cart later
        }
    }, [user?.id]);

    const fetchCart = async () => {
        if (!user) {
            console.log("CartContext: No user, skipping fetch");
            return;
        }
        console.log("CartContext: Fetching cart for user:", user.id);
        try {
            setLoading(true);
            // 1. Get user's cart
            let { data: cartData, error: cartError } = await supabase
                .from('carts')
                .select('id, user_email')
                .eq('user_id', user.id)
                .maybeSingle();

            if (cartError) {
                console.log("CartContext: Error fetching cart record:", cartError);
            }

            // Self-healing: Backfill email if missing
            if (cartData && !cartData.user_email && user.email) {
                console.log("CartContext: Backfilling user_email for cart:", cartData.id);
                const { error: updateError } = await supabase
                    .from('carts')
                    .update({ user_email: user.email })
                    .eq('id', cartData.id);

                if (updateError) {
                    console.error("CartContext: Error backfilling email:", updateError);
                } else {
                    cartData.user_email = user.email;
                }
            }

            if (!cartData) {
                // Cart doesn't exist, create one
                console.log("CartContext: Cart not found, creating new one...");
                const { data: newCart, error: createError } = await supabase
                    .from('carts')
                    .insert([{ user_id: user.id, user_email: user.email }])
                    .select()
                    .single();

                if (createError) {
                    if (createError.code === '23505') {
                        // Cart already exists (Unique constraint violation), retry fetch
                        console.warn("CartContext: Cart already exists (race condition), retrying fetch...");
                        const { data: retryCart, error: retryError } = await supabase
                            .from('carts')
                            .select('id')
                            .eq('user_id', user.id)
                            .maybeSingle();

                        if (retryError || !retryCart) {
                            console.error("CartContext: Retry failed. Cart exists but is not visible. Check RLS policies.");
                            // If we can't see it, we can't proceed.
                        } else {
                            cartData = retryCart;
                        }
                    } else {
                        console.error("CartContext: Error creating cart:", createError);
                        throw createError;
                    }
                } else {
                    cartData = newCart;
                }
            }

            console.log("CartContext: Cart ID found:", cartData.id);

            // 2. Get items
            const { data: items, error: itemsError } = await supabase
                .from('cart_items')
                .select('*, product:products(*)')
                .eq('cart_id', cartData.id);

            if (itemsError) {
                console.error("CartContext: Error fetching items:", itemsError);
                throw itemsError;
            }

            console.log("CartContext: Items fetched:", items);
            setCart(items || []);
        } catch (error) {
            console.error('CartContext: Error in fetchCart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            // Ensure cart exists (reuse logic or fetch/create)
            // For simplicity, let's assume fetchCart ran and we could store cartId in state, 
            // but to be safe lets get it again or rely on RLS/policies if we had them set up perfectly.
            // Let's do a quick check/create pattern again to be robust.

            let { data: cartData } = await supabase
                .from('carts')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!cartData) {
                console.log("CartContext: addToCart - Creating new cart with email...");
                const { data: newCart } = await supabase.from('carts').insert([{ user_id: user.id, user_email: user.email }]).select().single();
                cartData = newCart;
            }

            // Check if item exists
            const { data: existingItem } = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('cart_id', cartData.id)
                .eq('product_id', product.id)
                .single();

            if (existingItem) {
                // Update quantity
                const { error: updateError } = await supabase
                    .from('cart_items')
                    .update({ quantity: existingItem.quantity + quantity })
                    .eq('id', existingItem.id);

                if (updateError) throw updateError;
            } else {
                // Insert new item
                const { error: insertError } = await supabase
                    .from('cart_items')
                    .insert([{
                        cart_id: cartData.id,
                        product_id: product.id,
                        quantity: quantity
                    }]);

                if (insertError) throw insertError;
            }

            await fetchCart(); // Refresh state
            setIsCartOpen(true); // Open cart drawer/modal

        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add to cart');
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
            if (error) throw error;
            setCart(prev => prev.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', itemId);

            if (error) throw error;
            setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const clearCart = async () => {
        // Logic to clear cart items...
        // fetchCart();
    };

    const value = {
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        isCartOpen,
        setIsCartOpen,
        cartTotal: cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    return useContext(CartContext);
};
