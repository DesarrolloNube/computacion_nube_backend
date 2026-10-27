import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./assets/components/navbar.jsx";
import Footer from "./assets/components/footer.jsx";
import Login from "./pages/login.jsx";
import "./index.css"; 


function Home() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4">
      <h1 className="text-center text-3xl font-bold">
        Bienvenido a Super E-Ferretería
      </h1>
    </section>
  );
}

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