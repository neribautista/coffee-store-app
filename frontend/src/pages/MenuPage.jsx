import React, { useEffect, useState } from "react";
import "../styles/MenuPage.css";

const MenuPage = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: null, // Store the file object
  });
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/products");
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] }); // Handle file input
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle product creation or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    if (formData.image) {
      formDataToSend.append("image", formData.image); // Append the file if it exists
    }

    try {
      const url = editingProduct
        ? `http://localhost:3001/api/products/${editingProduct._id}`
        : "http://localhost:3001/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (response.ok) {
        alert(editingProduct ? "Product updated successfully!" : "Product created successfully!");
        setFormData({ name: "", price: "", image: null });
        setEditingProduct(null);
        fetchProducts(); // Refresh the product list
      } else {
        alert("Failed to save product.");
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  // Handle product deletion
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Product deleted successfully!");
        fetchProducts(); // Refresh the product list
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Handle edit button click
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, price: product.price, image: null });
  };

  return (
  <div className="menu-page-container">
    <div className="menu-page">
      <h1 className="menu-title">Menu Dashboard </h1>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Product Price"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="image"
          onChange={handleChange}
          required={!editingProduct} // Make image required only for new products
        />
        <button type="submit" className="form-button">
          {editingProduct ? "Update Product" : "Create Product"}
        </button>
        {editingProduct && (
          <button
            type="button"
            className="cancel-button"
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: "", price: "", image: null });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Product List */}
      <div className="product-list">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <img
              src={`http://localhost:3001/uploads/${product.image}`}
              alt={product.name}
              className="product-image"
            />
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">${product.price}</p>
            <div className="product-actions">
              <button onClick={() => handleEdit(product)} className="edit-button">
                Edit
              </button>
              <button onClick={() => handleDelete(product._id)} className="delete-button">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default MenuPage;