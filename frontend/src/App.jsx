import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./assets/components/navbar.jsx";
import Footer from "./assets/components/footer.jsx";
import Login from "./pages/login.jsx";
import Home from "./pages/home.jsx";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;