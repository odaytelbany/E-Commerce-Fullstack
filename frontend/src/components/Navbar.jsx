import React from 'react'
import { Link } from 'react-router'
import { Lock, LogIn, LogOut, ShoppingCart, UserPlus } from "lucide-react";
import { useAuthStore } from '../store/useAuthStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const isAdmin = user?.role === "admin";
    return (
        <header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800'>
            <div className='container mx-auto px-4 py-3 flex items-center justify-between'>
                <Link to="/" className='text-2xl font-bold text-emerald-400 items-center space-x-2 flex'>
                    E-Commerce
                </Link>
                <nav className='flex flex-wrap items-center gap-4'>
                    <Link to="/" className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'>
                        Home
                    </Link>
                    {
                        user && <Link to="/cart" className='relative group'>
                            <ShoppingCart className='inline-block mr-1 group-hover:text-emerald-400' size={20} />
                            <span className='hidden sm:inline text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'>Cart</span>
                            <span className='absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs group-hover:bg-emerald-400 transition duration-300 ease-in-out'>3</span>
                        </Link>
                    }
                    {
                        isAdmin && <Link to="/secret-dashboard" className='bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center'>
                            <Lock className='inline-block mr-1 ' size={18} />
                            <span className='hidden sm:inline '>Dashboard</span>
                        </Link>
                    }
                    {
                        user ? (
                            <button onClick={logout} className='bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center'>
                                <LogOut size={18} />
                                <span className='hidden sm:inline ml-2'>Log Out</span>
                            </button>
                        ) : (<>
                            <Link to={"/register"} className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center'>
                                <UserPlus className='mr-2' size={18} />
                                Sign Up
                            </Link>
                            <Link to={"/login"} className='bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center'>
                                <LogIn className='mr-2' size={18} />
                                Login
                            </Link>
                        </>)
                    }
                </nav>
            </div>
        </header>
    )
}

export default Navbar