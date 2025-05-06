import React, { useEffect, useState } from "react";
import "../styles/MenuPage.css";

const MenuPage = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: null,
  });
  const [editingProduct, setEditingProduct] = useState(null); 
  const [isAdmin, setIsAdmin] = useState(false); 

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Check if the logged-in user is an admin
    const user = JSON.parse(localStorage.getItem("user"));
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "fahrenheitcoffeeph@gmail.com";
    if (user && user.email === adminEmail) {
      setIsAdmin(true);
    }
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle product creation
  const handleCreate = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("image", formData.image);

    try {
      const response = await fetch("http://localhost:3001/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Product created successfully!");
        setFormData({ name: "", price: "", image: null });
        fetchProducts(); // Refresh the product list
      } else {
        alert("Failed to create product.");
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  // Handle product update
  const handleUpdate = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    if (formData.image) {
      formDataToSend.append("image", formData.image); // Append image only if it's updated
    }

    try {
      const response = await fetch(`http://localhost:3001/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Product updated successfully!");
        setFormData({ name: "", price: "", image: null });
        setEditingProduct(null);
        fetchProducts(); // Refresh the product list
      } else {
        alert("Failed to update product.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // Handle product deletion
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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
    setFormData({
      name: product.name,
      price: product.price,
      image: null, 
    });
  };

  return (
    <div className="menu-page">
      <h1 className="menu-title">Menu</h1>

      {/* Show product creation or update form */}
      {isAdmin && (
        <form onSubmit={editingProduct ? handleUpdate : handleCreate} className="product-form">
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
            required={!editingProduct} 
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
      )}

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
            {/* Show Edit and Delete buttons only for admins */}
            {isAdmin && (
              <div className="product-actions">
                <button
                  className="edit-button"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(product._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
