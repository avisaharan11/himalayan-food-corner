import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Menu.css';

const Menu = ({ addToOrder, viewCart, order, clearCart }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [quantity, setQuantity] = useState({});
    const [modifiers, setModifiers] = useState({});

    useEffect(() => {
        const fetchMenuItems = async () => {
            const res = await axios.get(`${process.env.REACT_APP_MONGO_BASE_URL}/menu`);
            setMenuItems(res.data);

            const initialQuantities = {};
            const initialModifiers = {};
            order.forEach(item => {
                initialQuantities[item._id] = item.quantity;
                initialModifiers[item._id] = item.modifier;
            });
            setQuantity(initialQuantities);
            setModifiers(initialModifiers);
        };

        fetchMenuItems();
    }, [order]);

    const handleQuantityChange = (id, delta) => {
        const item = menuItems.find(menuItem => menuItem._id === id);
        const newQuantity = (quantity[id] || 0) + delta;
        setQuantity(prevQuantity => ({
            ...prevQuantity,
            [id]: newQuantity > 0 ? newQuantity : 0
        }));
        addToOrder({ ...item, modifier: modifiers[id] }, newQuantity);
    };

    const handleModifierChange = (id, value) => {
        setModifiers(prevModifiers => ({
            ...prevModifiers,
            [id]: value
        }));
    };

    return (
        <div className="menu">
            {menuItems.map(item => (
                <div key={item._id} className="menu-item">
                    <img src={item.photo} alt={item.name} />
                    <h3>{item.name}</h3>
                    <p>Price: ${item.price}</p>
                    <div className="quantity-controls">
                        <button onClick={() => handleQuantityChange(item._id, -1)} disabled={!quantity[item._id]}>-</button>
                        <span>{quantity[item._id] || 0}</span>
                        <button onClick={() => handleQuantityChange(item._id, 1)}>+</button>
                    </div>
                    {quantity[item._id] > 0 && item.modifiers.length > 0 && (
                        <select onChange={(e) => handleModifierChange(item._id, e.target.value)} value={modifiers[item._id] || ''}>
                            <option value="">Select Modifier</option>
                            {item.modifiers.map((modifier, index) => (
                                <option key={index} value={modifier}>{modifier}</option>
                            ))}
                        </select>
                    )}
                </div>
            ))}
            {Object.values(quantity).some(qty => qty > 0) && (
                <div className="cart-actions">
                    <button onClick={clearCart} className="clear-cart-button">Clear Cart</button>
                    <button onClick={() => viewCart(quantity, modifiers)} className="view-cart-button">View Cart</button>
                </div>
            )}
        </div>
    );
};

export default Menu;
