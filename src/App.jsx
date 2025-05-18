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
import Challen from "./pages/Challen";
import AddChallan from "./pages/Challen/AddChallan";
import ViewChallan from "./pages/Challen/ViewChallan";
import Expenses from "./pages/Expenses";
import ViewExpense from "./pages/Expenses/ViewExpense";
import Coupons from "./pages/Coupons";
import Ratings from "./pages/Ratings";
import Customers from "./pages/Customers";
import ViewCustomer from './pages/Customers/ViewCustomer';
import Transitions from './pages/Transitions';
import Activity from './pages/Activity';
import Orders from './pages/Orders';
import ViewOrder from './pages/Orders/ViewOrder';
import CreateOrder from './pages/Orders/CreateOrder';

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
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/customers/:id" element={<ViewCustomer />} />
                      <Route path="/challens" element={<Challen />} />
                      <Route path="/challans" element={<Challen />} />
                      <Route path="/challans/add" element={<AddChallan />} />
                      <Route path="/challans/:id" element={<ViewChallan />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/expenses/:id" element={<ViewExpense />} />
                      <Route path="/coupons" element={<Coupons />} />
                      <Route path="/ratings" element={<Ratings />} />
                      <Route path="/transitions" element={<Transitions />} />
                      <Route path="/activity" element={<Activity />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/create" element={<CreateOrder />} />
                      <Route path="/orders/:id" element={<ViewOrder />} />
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
