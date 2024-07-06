import React, { useEffect, useState, useRef } from 'react';
import './Admin.css';
import useSound from 'use-sound';
import newOrderSound from '../sounds/new-order.mp3';
import * as Realm from "realm-web";
import { FaLongArrowAltUp } from "react-icons/fa";

const REALM_APP_ID = "application-0-jlihamb"; // replace with your App ID
const app = new Realm.App({ id: REALM_APP_ID });

const Admin = () => {
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [viewAllOrders, setViewAllOrders] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        photo: '',
        modifiers: '',
        available: true,
        category: 'Starters'
    });
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [playNewOrderSound] = useSound(newOrderSound);
    const prevOrdersLength = useRef(0);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const login = async () => {
            const user = await app.logIn(Realm.Credentials.anonymous());
            setUser(user);
        };
        login();
    }, []);

    useEffect(() => {
        if (user) {
            fetchOrders();
            fetchMenuItems();
            const intervalId = setInterval(fetchOrders, 3000); // Check for new orders every 3 seconds
            return () => clearInterval(intervalId);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await user.functions.fetchOrders();
            setOrders(res);
            if (res.length > prevOrdersLength.current) {
                playNewOrderSound();
                alert('New order received!');
            }
            prevOrdersLength.current = res.length;
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const res = await user.functions.fetchMenuItems();
            setMenuItems(res);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const markAsReady = async (id) => {
        try {
            const user = app.currentUser || await app.logIn(Realm.Credentials.anonymous());
            await user.functions.updateOrderStatus({ id: id.toString(), status: 'Ready' });
            setOrders(orders.map(order => (order._id === id ? { ...order, status: 'Ready' } : order)));
        } catch (error) {
            console.error('Error marking order as ready:', error);
        }
    };

    const markAsCollected = async (id) => {
        try {
            const user = app.currentUser || await app.logIn(Realm.Credentials.anonymous());
            await user.functions.updateOrderStatus({ id: id.toString(), status: 'Collected' });
            setOrders(orders.filter(order => order._id !== id));
        } catch (error) {
            console.error('Error marking order as collected:', error);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();

        const modifiersArray = newItem.modifiers ? newItem.modifiers.split(',').map(modifier => modifier.trim()) : [];
        const itemToAdd = { ...newItem, price: parseFloat(newItem.price), modifiers: modifiersArray };

        try {
            const user = app.currentUser || await app.logIn(Realm.Credentials.anonymous());
            const insertedId = await user.functions.addMenuItem(itemToAdd);
            setMenuItems([...menuItems, { ...itemToAdd, _id: insertedId }]);
            setNewItem({
                name: '',
                price: '',
                photo: '',
                modifiers: '',
                available: true,
                category: 'Starters'
            });
            setShowForm(false);
        } catch (error) {
            console.error('Error adding menu item:', error);
        }
    };

    const handleEditItem = (id) => {
        const item = menuItems.find(item => item._id === id);
        setEditingItem(item);
        setNewItem({
            name: item.name,
            price: item.price,
            photo: item.photo,
            modifiers: item.modifiers ? item.modifiers.join(', ') : '',
            available: item.available,
            category: item.category
        });
        setShowForm(true);
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();

        const modifiersArray = newItem.modifiers ? newItem.modifiers.split(',').map(modifier => modifier.trim()) : [];
        const itemToUpdate = { ...newItem, price: parseFloat(newItem.price), modifiers: modifiersArray, id: editingItem._id.toString() };

        try {
            const user = app.currentUser || await app.logIn(Realm.Credentials.anonymous());
            await user.functions.updateMenuItem(itemToUpdate);
            setMenuItems(menuItems.map(item => (item._id === editingItem._id ? { ...itemToUpdate, _id: editingItem._id } : item)));
            setEditingItem(null);
            setNewItem({
                name: '',
                price: '',
                photo: '',
                modifiers: '',
                available: true,
                category: 'Starters'
            });
            setShowForm(false);
        } catch (error) {
            console.error('Error updating menu item:', error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            const user = app.currentUser || await app.logIn(Realm.Credentials.anonymous());
            await user.functions.deleteMenuItem({ id: id.toString() });
            setMenuItems(menuItems.filter(item => item._id !== id));
        } catch (error) {
            console.error('Error deleting menu item:', error);
        }
    };

    const toggleAvailability = async (id) => {
        try {
            const user = app.currentUser || await app.logIn(Realm.Credentials.anonymous());
            await user.functions.toggleAvailability({ id: id.toString() });
            setMenuItems(menuItems.map(item => (item._id === id ? { ...item, available: !item.available } : item)));
        } catch (error) {
            console.error('Error toggling availability:', error);
        }
    };

    const calculateOrderTotal = (items) => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    const filterItems = selectedCategory === 'All' ? menuItems : menuItems.filter(item => item.category === selectedCategory);
    return (
        <div className="admin">
            <h2>Admin Panel</h2>
            <div className="orders-toggle">
                {viewAllOrders ? (
                    <button onClick={() => setViewAllOrders(false)}>Pending Orders</button>
                ) : (
                    <button onClick={() => setViewAllOrders(true)}>All Orders</button>
                )}
            </div>
            <div className="orders">
                {orders.filter(order => viewAllOrders || order.status !== 'Collected').map(order => (
                    <div key={order._id} className="order">
                        <p><strong>{order.customerName}</strong>: {order.status}</p>
                        <ul>
                            {order.items.map((item, index) => (
                                <li key={index}>{item.name} - Quantity: {item.quantity} - Price: ${item.price * item.quantity}</li>
                            ))}
                        </ul>
                        <p>Total: ${calculateOrderTotal(order.items)}</p>
                        {order.status === 'Order Received' && (
                            <button onClick={() => markAsReady(order._id)} className="mark-as-ready-button">Mark as Ready</button>
                        )}
                        {order.status === 'Ready' && (
                            <button onClick={() => markAsCollected(order._id)} className="mark-as-collected-button">Mark as Collected</button>
                        )}
                    </div>
                ))}
            </div>
            <div className="menu-management">
            
                {showMenu && (
                    <>
                        {showForm && (
                            <div className="form-container">
                                <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                                <form onSubmit={editingItem ? handleUpdateItem : handleAddItem}>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        placeholder="Item Name"
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="price"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                        placeholder="Item Price"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="photo"
                                        value={newItem.photo}
                                        onChange={(e) => setNewItem({ ...newItem, photo: e.target.value })}
                                        placeholder="Photo URL"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="modifiers"
                                        value={newItem.modifiers}
                                        onChange={(e) => setNewItem({ ...newItem, modifiers: e.target.value })}
                                        placeholder="Modifiers (comma separated)"
                                    />
                                    <select
                                        name="category"
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        required
                                    >
                                        <option value="Starters">Starters</option>
                                        <option value="Main Course">Main Course</option>
                                        <option value="Drinks">Drinks</option>
                                    </select>
                                    <button type="submit">{editingItem ? 'Update Item' : 'Add Item'}</button>
                                    <button type="button" onClick={() => {setEditingItem(null);setShowForm(false);}}>Cancel</button>
                                </form>
                            </div>
                        )}
                        {showMenu && <h2>Menu</h2>}
                        <div className="category-buttons">
                            {['All', 'Starters', 'Main Course', 'Drinks'].map(category => (
                                <button
                                    key={category}
                                    className={selectedCategory === category ? 'selected' : ''}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        {!showForm && (<button onClick={() => {setEditingItem(null); setShowForm(false); setShowForm(true)}}>Add Item +</button>)}
                        <div className="menu-items">
                            {filterItems.map(item => (
                                <div key={item._id} className="menu-item">
                                    <h4>{item.name}</h4>
                                    <p>Price: ${item.price}</p>
                                    <p>Modifiers: {item.modifiers ? item.modifiers.join(', ') : ''}</p>
                                    <p>Category: {item.category}</p>
                                    <button onClick={() => handleEditItem(item._id)}>Edit</button>
                                    <button onClick={() => handleDeleteItem(item._id)}>Delete</button>
                                    <label className="toggle-availability">
                                        <input
                                            type="checkbox"
                                            checked={item.available}
                                            onChange={() => toggleAvailability(item._id)}
                                        />
                                        <span>{item.available ? 'Available' : 'Unavailable'}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                <button onClick={() => setShowMenu(!showMenu)}>{showMenu ? 'Hide Menu' : 'View Menu'}</button>
            </div>
        </div>
    );
    
    
};

export default Admin;
