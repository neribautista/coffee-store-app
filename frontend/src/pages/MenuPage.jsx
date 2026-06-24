import React, { useEffect, useState } from "react";
import "../styles/MenuPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import ProductModal from "../components/ProductModal";
import { getCart, setCart } from "../utils/cartStorage";

const CATEGORIES = ["All", "Coffee", "Matcha Bar", "Hojicha", "Cookies"];
const VARIANTS = ["None", "Hot / Iced", "Iced only", "Hot only"];

const EMPTY_FORM = {
  name: "",
  price: "",
  boxPrice: "",
  description: "",
  category: "",
  variant: "None",
  isBestSeller: false,
  isMustTry: false,
  image: null,
  options: [], // [{ name, required, multiSelect, choices: [{name, priceDelta}] }]
};

const EMPTY_GROUP = { name: "", required: false, multiSelect: false, choices: [] };
const EMPTY_CHOICE = { name: "", priceDelta: "" };

const MenuPage = () => {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // NEW: which product's "+" popup is open
  const [activeProduct, setActiveProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/products", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch products: ${response.statusText}`);
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    const user = JSON.parse(localStorage.getItem("user"));
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "fahrenheitcoffeeph@gmail.com";
    setIsAdmin(user && user.email === adminEmail);
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ---- Admin: option group builder helpers ----

  const addOptionGroup = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { ...EMPTY_GROUP, choices: [] }],
    }));
  };

  const removeOptionGroup = (groupIndex) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== groupIndex),
    }));
  };

  const updateOptionGroup = (groupIndex, field, value) => {
    setFormData((prev) => {
      const options = [...prev.options];
      options[groupIndex] = { ...options[groupIndex], [field]: value };
      return { ...prev, options };
    });
  };

  const addChoice = (groupIndex) => {
    setFormData((prev) => {
      const options = [...prev.options];
      options[groupIndex] = {
        ...options[groupIndex],
        choices: [...options[groupIndex].choices, { ...EMPTY_CHOICE }],
      };
      return { ...prev, options };
    });
  };

  const removeChoice = (groupIndex, choiceIndex) => {
    setFormData((prev) => {
      const options = [...prev.options];
      options[groupIndex] = {
        ...options[groupIndex],
        choices: options[groupIndex].choices.filter((_, i) => i !== choiceIndex),
      };
      return { ...prev, options };
    });
  };

  const updateChoice = (groupIndex, choiceIndex, field, value) => {
    setFormData((prev) => {
      const options = [...prev.options];
      const choices = [...options[groupIndex].choices];
      choices[choiceIndex] = { ...choices[choiceIndex], [field]: value };
      options[groupIndex] = { ...options[groupIndex], choices };
      return { ...prev, options };
    });
  };

  // ---- Build multipart form data, serializing options as JSON ----

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === "options") {
        // Clean up empty rows and coerce priceDelta to a number before sending
        const cleanedOptions = (v || [])
          .filter((g) => g.name.trim() !== "")
          .map((g) => ({
            name: g.name.trim(),
            required: !!g.required,
            multiSelect: !!g.multiSelect,
            choices: (g.choices || [])
              .filter((c) => c.name.trim() !== "")
              .map((c) => ({
                name: c.name.trim(),
                priceDelta: parseFloat(c.priceDelta) || 0,
              })),
          }));
        fd.append("options", JSON.stringify(cleanedOptions));
      } else if (v !== null && v !== "") {
        fd.append(k, v);
      }
    });
    return fd;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: buildFormData(),
      });
      if (response.ok) {
        setFormData(EMPTY_FORM);
        setShowForm(false);
        fetchProducts();
      } else alert("Failed to create product.");
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: buildFormData(),
      });
      if (response.ok) {
        setFormData(EMPTY_FORM);
        setEditingProduct(null);
        setShowForm(false);
        fetchProducts();
      } else alert("Failed to update product.");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) fetchProducts();
      else alert("Failed to delete product.");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      boxPrice: product.boxPrice || "",
      description: product.description || "",
      category: product.category || "",
      variant: product.variant || "None",
      isBestSeller: product.isBestSeller || false,
      isMustTry: product.isMustTry || false,
      image: null,
      options: (product.options || []).map((g) => ({
        ...g,
        choices: (g.choices || []).map((c) => ({ ...c, priceDelta: String(c.priceDelta) })),
      })),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- Cart: now stores selected options + the per-item resolved price ----

  const handleAddToCart = (product, selectedOptions, resolvedPrice) => {
    const cart = getCart();

    // Each distinct combination of product + options is its own cart line,
    // since "Oat Milk Latte" and "Almond Milk Latte" aren't the same order.
    const optionsKey = (selectedOptions || [])
      .map((o) => `${o.groupName}:${o.choiceName}`)
      .sort()
      .join("|");

    const existingItem = cart.find(
      (item) => item.id === product._id && item.optionsKey === optionsKey
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product._id,
        name: product.name,
        image: product.image,
        basePrice: Number(product.price),
        price: resolvedPrice, // price including selected option add-ons, per unit
        selectedOptions: selectedOptions || [],
        optionsKey,
        quantity: 1,
      });
    }

    setCart(cart); // also notifies Navbar's cart badge via cart-updated event
    setActiveProduct(null);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const resetForm = () => {
    setEditingProduct(null);
    setShowForm(false);
    setFormData(EMPTY_FORM);
  };

  return (
    <div className="menu-page">
      <div className="menu-page-inner">
      {/* Header */}
      <div className="menu-header">
        <h1 className="menu-title">Detailed Menu</h1>
        {isAdmin && (
          <button
            className="admin-add-btn"
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
          >
            {showForm ? "Cancel" : "+ Add Product"}
          </button>
        )}
      </div>

      {/* Admin Form */}
      {isAdmin && showForm && (
        <div className="product-form-wrapper">
          <form onSubmit={editingProduct ? handleUpdate : handleCreate} className="product-form">
            <h3 className="form-title">{editingProduct ? "Edit Product" : "New Product"}</h3>

            {/* Name + Price */}
            <div className="form-row">
              <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
              <input type="number" name="price" placeholder="Price (per piece)" value={formData.price} onChange={handleChange} required />
            </div>

            {/* Box price */}
            <input
              type="number"
              name="boxPrice"
              placeholder="Box price for 6 pcs — optional (e.g. 640)"
              value={formData.boxPrice}
              onChange={handleChange}
            />

            {/* Description */}
            <input
              type="text"
              name="description"
              placeholder="Description (e.g. double espresso + whole milk + caramel)"
              value={formData.description}
              onChange={handleChange}
            />

            {/* Category + Variant */}
            <div className="form-row">
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select name="variant" value={formData.variant} onChange={handleChange}>
                {VARIANTS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Badges */}
            <div className="form-checkboxes">
              <label className="form-checkbox">
                <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} />
                <span>Best Seller</span>
              </label>
              <label className="form-checkbox">
                <input type="checkbox" name="isMustTry" checked={formData.isMustTry} onChange={handleChange} />
                <span>Must Try</span>
              </label>
            </div>

            {/* Image */}
            <input type="file" name="image" onChange={handleChange} required={!editingProduct} />

            {/* NEW: Option groups builder (e.g. "Add Milk", "Syrup") */}
            <div className="options-builder">
              <div className="options-builder-header">
                <h4>Customization Options</h4>
                <button type="button" className="add-group-btn" onClick={addOptionGroup}>
                  + Add Option Group
                </button>
              </div>

              {formData.options.map((group, gIndex) => (
                <div key={gIndex} className="option-group-editor">
                  <div className="option-group-editor-row">
                    <input
                      type="text"
                      placeholder="Group name (e.g. Add Milk)"
                      value={group.name}
                      onChange={(e) => updateOptionGroup(gIndex, "name", e.target.value)}
                    />
                    <label className="inline-checkbox">
                      <input
                        type="checkbox"
                        checked={group.required}
                        onChange={(e) => updateOptionGroup(gIndex, "required", e.target.checked)}
                      />
                      Required
                    </label>
                    <label className="inline-checkbox">
                      <input
                        type="checkbox"
                        checked={group.multiSelect}
                        onChange={(e) => updateOptionGroup(gIndex, "multiSelect", e.target.checked)}
                      />
                      Allow multiple
                    </label>
                    <button
                      type="button"
                      className="remove-group-btn"
                      onClick={() => removeOptionGroup(gIndex)}
                    >
                      Remove group
                    </button>
                  </div>

                  {group.choices.map((choice, cIndex) => (
                    <div key={cIndex} className="option-choice-editor-row">
                      <input
                        type="text"
                        placeholder="Choice name (e.g. Oat Milk)"
                        value={choice.name}
                        onChange={(e) => updateChoice(gIndex, cIndex, "name", e.target.value)}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="+price (e.g. 0.75)"
                        value={choice.priceDelta}
                        onChange={(e) => updateChoice(gIndex, cIndex, "priceDelta", e.target.value)}
                      />
                      <button
                        type="button"
                        className="remove-choice-btn"
                        onClick={() => removeChoice(gIndex, cIndex)}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button type="button" className="add-choice-btn" onClick={() => addChoice(gIndex)}>
                    + Add Choice
                  </button>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="submit" className="form-button">
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
              {editingProduct && (
                <button type="button" className="cancel-button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Category Tabs + Search */}
      <div className="menu-controls">
        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="product-list">
        {filteredProducts.map((product) => (
          <div key={product._id} className="product-card">

            {/* Image on top */}
            <div className="product-image-wrap">
              <img
                src={`http://localhost:3001/uploads/${product.image}`}
                alt={product.name}
                className="product-image"
              />
              {/* Badges overlaid on image */}
              <div className="product-badges">
                {product.isBestSeller && <span className="badge badge-bestseller">Best Seller</span>}
                {product.isMustTry && <span className="badge badge-musttry">Must Try</span>}
              </div>
            </div>

            {/* Info below */}
            <div className="product-info">
              <div className="product-meta">
                {product.category && <span className="product-category-tag">{product.category}</span>}
                {product.variant && product.variant !== "None" && (
                  <span className="product-variant-tag">{product.variant}</span>
                )}
              </div>

              <h3 className="product-name">{product.name}</h3>

              {product.description && (
                <p className="product-description">{product.description}</p>
              )}

              <div className="divider"></div>

              <div className="product-footer">
                <div className="product-pricing">
                  <span className="product-price">₱{parseFloat(product.price).toFixed(0)}</span>
                  {product.boxPrice && (
                    <span className="product-box-price">₱{parseFloat(product.boxPrice).toFixed(0)} / box of 6</span>
                  )}
                </div>

                {!isAdmin && (
                  <button
                    className="add-to-cart-button"
                    onClick={() => setActiveProduct(product)}
                    aria-label="Add to cart"
                  >
                    +
                  </button>
                )}
                {isAdmin && (
                  <div className="product-actions">
                    <button className="edit-button" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="delete-button" onClick={() => handleDelete(product._id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="empty-state">No products found.</div>
        )}
      </div>
      </div>

      {/* NEW: customization popup, shown when "+" is clicked */}
      {activeProduct && (
        <ProductModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default MenuPage;
