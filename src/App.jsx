import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import AddProduct from "./pages/Products/AddProduct";
import ViewProduct from "./pages/Products/ViewProduct";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { Toaster } from 'react-hot-toast';
import Suppliers from "./pages/Suppliers";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <>
                <Header />
                <div className="main d-flex">
                  <div className="sidebarwrapper">
                    <Sidebar />
                  </div>
                  <div className="contentwrapper">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/add" element={<AddProduct />} />
                      <Route path="/products/:id" element={<ViewProduct />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/suppliers" element={<Suppliers />} />
                    </Routes>
                  </div>
                </div>
              </>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
