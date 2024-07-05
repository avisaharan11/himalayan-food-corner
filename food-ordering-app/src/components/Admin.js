import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Admin.css';
import useSound from 'use-sound';
import newOrderSound from '../sounds/new-order.mp3';

const Admin = () => {
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [viewAllOrders, setViewAllOrders] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        photo: '',
        modifiers: '',
        available: true
    });
    const [editingItem, setEditingItem] = useState(null);
    const [playNewOrderSound] = useSound(newOrderSound);
    const prevOrdersLength = useRef(0);

    useEffect(() => {
        const fetchOrders = async () => {
            const res = await axios.get('http://localhost:5000/orders');
            setOrders(res.data);
            if (res.data.length > prevOrdersLength.current) {
                playNewOrderSound();
                alert('New order received!');
            }
            prevOrdersLength.current = res.data.length;
        };

        const fetchMenuItems = async () => {
            const res = await axios.get('http://localhost:5000/menu');
            setMenuItems(res.data);
        };

        fetchOrders();
        fetchMenuItems();

        const intervalId = setInterval(fetchOrders, 3000); // Check for new orders every 3 seconds

        return () => clearInterval(intervalId);
    }, [playNewOrderSound]);

    const markAsReady = (id) => {
        axios.patch(`http://localhost:5000/orders/${id}`, { status: 'Ready' })
            .then(res => {
                console.log(res.data);
                setOrders(orders.map(order => (order._id === id ? { ...order, status: 'Ready' } : order)));
            })
            .catch(err => console.error(err));
    };

    const markAsCollected = (id) => {
        axios.patch(`http://localhost:5000/orders/${id}`, { status: 'Collected' })
            .then(res => {
                console.log(res.data);
                setOrders(orders.filter(order => order._id !== id));
                window.open(`/print-receipt/${id}`, '_blank');
            })
            .catch(err => console.error(err));
    };

    const handleAddItem = (e) => {
        e.preventDefault();

        const modifiersArray = newItem.modifiers ? newItem.modifiers.split(',').map(modifier => modifier.trim()) : [];

        const itemToAdd = { ...newItem, price: parseFloat(newItem.price), modifiers: modifiersArray };

        axios.post('http://localhost:5000/menu', itemToAdd)
            .then(res => {
                setMenuItems([...menuItems, res.data]);
                setNewItem({
                    name: '',
                    price: '',
                    photo: '',
                    modifiers: '',
                    available: true
                });
            })
            .catch(err => console.error(err));
    };

    const handleEditItem = (id) => {
        const item = menuItems.find(item => item._id === id);
        setEditingItem(item);
        setNewItem({
            name: item.name,
            price: item.price,
            photo: item.photo,
            modifiers: item.modifiers ? item.modifiers.join(', ') : '',
            available: item.available
        });
    };

    const handleUpdateItem = (e) => {
        e.preventDefault();

        const modifiersArray = newItem.modifiers ? newItem.modifiers.split(',').map(modifier => modifier.trim()) : [];

        const itemToUpdate = { ...newItem, price: parseFloat(newItem.price), modifiers: modifiersArray };

        axios.put(`http://localhost:5000/menu/${editingItem._id}`, itemToUpdate)
            .then(res => {
                setMenuItems(menuItems.map(item => (item._id === editingItem._id ? res.data : item)));
                setEditingItem(null);
                setNewItem({
                    name: '',
                    price: '',
                    photo: '',
                    modifiers: '',
                    available: true
                });
            })
            .catch(err => console.error(err));
    };

    const handleDeleteItem = (id) => {
        axios.delete(`http://localhost:5000/menu/${id}`)
            .then(res => {
                setMenuItems(menuItems.filter(item => item._id !== id));
            })
            .catch(err => console.error(err));
    };

    const toggleAvailability = (id) => {
        const item = menuItems.find(item => item._id === id);
        axios.put(`http://localhost:5000/menu/${id}`, { available: !item.available })
            .then(res => {
                setMenuItems(menuItems.map(item => (item._id === id ? res.data : item)));
            })
            .catch(err => console.error(err));
    };

    const calculateOrderTotal = (items) => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

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
                    <button type="submit">{editingItem ? 'Update Item' : 'Add Item'}</button>
                    {editingItem && <button type="button" onClick={() => setEditingItem(null)}>Cancel Edit</button>}
                </form>
                <h3>Menu Items</h3>
                <div className="menu-items">
                    {menuItems.map(item => (
                        <div key={item._id} className="menu-item">
                            <h4>{item.name}</h4>
                            <p>Price: ${item.price}</p>
                            <p>Modifiers: {item.modifiers ? item.modifiers.join(', ') : ''}</p>
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
            </div>
        </div>
    );
};

export default Admin;