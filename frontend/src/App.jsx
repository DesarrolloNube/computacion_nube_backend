import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./assets/components/navbar.jsx";
import Footer from "./assets/components/footer.jsx";
import Login from "./pages/login.jsx";
import Registro from "./pages/registro.jsx";
import Home from "./pages/home.jsx";
import Productos from "./pages/productos.jsx";

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
            <Route path="/registro" element={<Registro />} />
            <Route path="/productos" element={<Productos />} />

          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
