import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import MaterialCatalog from './pages/MaterialCatalog';
import CategoryManagement from './pages/CategoryManagement';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Dashboard />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          <Route path="/materials" element={<MaterialCatalog />} />
          <Route path="/categories" element={<CategoryManagement />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
