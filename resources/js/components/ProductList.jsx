import React, { useState, useEffect } from "react";
import axios from 'axios';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Función para obtener productos
  const fetchProducts = async (page = 1) => {
    try {

      const response = await fetch(`http://localhost/api/products?page=${page}`, {
        credentials: "include",
      });

      if (response.redirected) {
        window.location.href = response.url; // Redirigir manualmente si Laravel lo hace
        return;
      }

      const data = await response.json();
      setProducts(data.data); // Productos de la página actual
      setPagination(data.meta); // Información de la paginación
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Llamar a la API cuando cambie la página actual
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // Función para manejar el cambio de página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      setCurrentPage(page);
    }
  };

  // Función para eliminar un producto
  const deleteProduct = async (productId) => {

    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) return;

    try {
      await axios.get("/sanctum/csrf-cookie"); // Obtener CSRF

      await axios.delete(`/api/products/${productId}`, { withCredentials: true });

      alert("Producto eliminado correctamente");
      setProducts(products.filter(product => product.id !== productId));
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403) {
          alert("No tienes permiso para eliminar este producto.");
        } else {
          alert(`Error: ${error.response.status} - ${error.response.data.message}`);
        }
      } else {
        alert("Error eliminando el producto.");
      }
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Product List</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <li
            key={product.id}
            className="border p-4 rounded shadow-sm bg-white flex flex-row"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-32 h-32 object-cover rounded mr-4"
            />
            <div className="ml-4 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-700 mb-2">{product.description}</p>
                <p className="text-gray-900 font-bold mb-2">
                  Price: ${product.price}
                </p>
                <p className="text-gray-700">Quantity: {product.quantity}</p>
              </div>
              <div className="flex justify-end items-end mt-auto">
                <button onClick={() => deleteProduct(product.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Paginación */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-black"
            }`}
        >
          &laquo; Previous
        </button>

        {Array.from({ length: pagination.last_page || 0 }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded ${currentPage === index + 1
              ? "bg-blue-500 text-black"
              : "bg-gray-200"
              }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pagination.last_page}
          className={`px-4 py-2 rounded ${currentPage === pagination.last_page
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-black"
            }`}
        >
          Next &raquo;
        </button>
      </div>
    </div>
  );
}
