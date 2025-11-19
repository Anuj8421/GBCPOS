import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [storeStatus, setStoreStatus] = useState('open'); // 'open' or 'closed'
  const [notifications, setNotifications] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const value = {
    storeStatus,
    setStoreStatus,
    notifications,
    addNotification,
    removeNotification,
    selectedOrder,
    setSelectedOrder
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};