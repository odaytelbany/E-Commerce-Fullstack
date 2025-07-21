import {Route, Routes } from "react-router"
import HomePage from "./pages/HomePage"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/signup" element={<SignupPage />}/>
        <Route path="/login" element={<LoginPage />}/>
      </Routes>
    </div>
  )
}

export default App