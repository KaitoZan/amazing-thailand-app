 // src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const getInitialUser = () => {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

export const AuthProvider = ({ children }) => {
  
  const [currentUser, setCurrentUser] = useState(getInitialUser);
  const [isLoading, setIsLoading] = useState(true); 
  
  useEffect(() => {
    
    const userFromStorage = getInitialUser();
    setCurrentUser(userFromStorage);
    setIsLoading(false); 
  }, []); 

  
  const login = (userData) => {
    
    setCurrentUser(userData);
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
  };
  
  const logout = () => {
    setCurrentUser(null);
    
    localStorage.removeItem('currentUser');
    
  };
  
  const value = {
    currentUser, 
    isLoading,   
    login,       
    logout,     
    isLoggedIn: !!currentUser, 
  };

  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};