import React, { useEffect, useMemo, useState } from "react";
import "../styles/ProductModal.css";

/**
 * ProductModal
 *
 * Renders the "+" popup shown in your mockup:
 * - Product name as header
 * - One block per option group (e.g. "Add Milk", "Syrup")
 * - Radio buttons if group.multiSelect is false, checkboxes if true
 * - "Required" badge + "Select 1" hint for required groups
 * - Live-updating total price in the Add to Cart button
 *
 * Expects product.options to look like:
 * [
 *   {
 *     name: "Add Milk",
 *     required: true,
 *     multiSelect: false,
 *     choices: [
 *       { name: "Whole Milk", priceDelta: 0 },
 *       { name: "Oat Milk", priceDelta: 0.75 },
 *       ...
 *     ]
 *   },
 *   ...
 * ]
 */

const ProductModal = ({ product, onClose, onAddToCart }) => {
  // selections shape: { [groupName]: string }            for single-select
  //                    { [groupName]: string[] }          for multi-select
  const [selections, setSelections] = useState({});
  const [error, setError] = useState("");

  const options = product?.options || [];

  // Initialize defaults: for single-select required groups with choices,
  // nothing is pre-selected (forces an explicit choice), matching mockup.
  useEffect(() => {
    setSelections({});
    setError("");
  }, [product]);

  // Lock background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSingleSelect = (groupName, choiceName) => {
    setSelections((prev) => ({ ...prev, [groupName]: choiceName }));
    setError("");
  };

  const handleMultiToggle = (groupName, choiceName) => {
    setSelections((prev) => {
      const current = Array.isArray(prev[groupName]) ? prev[groupName] : [];
      const next = current.includes(choiceName)
        ? current.filter((c) => c !== choiceName)
        : [...current, choiceName];
      return { ...prev, [groupName]: next };
    });
    setError("");
  };

  const optionsTotalDelta = useMemo(() => {
    let total = 0;
    options.forEach((group) => {
      const selected = selections[group.name];
      if (!selected) return;
      if (group.multiSelect) {
        (selected || []).forEach((choiceName) => {
          const choice = group.choices.find((c) => c.name === choiceName);
          if (choice) total += Number(choice.priceDelta) || 0;
        });
      } else {
        const choice = group.choices.find((c) => c.name === selected);
        if (choice) total += Number(choice.priceDelta) || 0;
      }
    });
    return total;
  }, [selections, options]);

  const basePrice = Number(product?.price) || 0;
  const totalPrice = basePrice + optionsTotalDelta;

  const validateAndAdd = () => {
    // Check every required group has a non-empty selection
    for (const group of options) {
      if (!group.required) continue;
      const selected = selections[group.name];
      const isEmpty = group.multiSelect ? !selected || selected.length === 0 : !selected;
      if (isEmpty) {
        setError(`Please select an option for "${group.name}"`);
        return;
      }
    }

    // Build a flat, readable list of selected options to store on the cart line
    const selectedOptions = [];
    options.forEach((group) => {
      const selected = selections[group.name];
      if (!selected) return;
      if (group.multiSelect) {
        selected.forEach((choiceName) => {
          const choice = group.choices.find((c) => c.name === choiceName);
          if (choice) {
            selectedOptions.push({
              groupName: group.name,
              choiceName: choice.name,
              priceDelta: Number(choice.priceDelta) || 0,
            });
          }
        });
      } else {
        const choice = group.choices.find((c) => c.name === selected);
        if (choice) {
          selectedOptions.push({
            groupName: group.name,
            choiceName: choice.name,
            priceDelta: Number(choice.priceDelta) || 0,
          });
        }
      }
    });

    onAddToCart(product, selectedOptions, totalPrice);
  };

  if (!product) return null;

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-modal-header">
          <h2 className="product-modal-title">{product.name}</h2>
          <button className="product-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="product-modal-body">
          {options.length === 0 && (
            <p className="product-modal-no-options">
              No customization needed for this item.
            </p>
          )}

          {options.map((group) => (
            <div key={group.name} className="option-group">
              <div className="option-group-header">
                <span className="option-group-name">{group.name}</span>
                {group.required && <span className="option-required-badge">Required</span>}
              </div>
              <p className="option-group-hint">
                {group.multiSelect ? "Select any" : "Select 1"}
              </p>

              <div className="option-choices">
                {group.choices.map((choice) => {
                  const isMulti = group.multiSelect;
                  const isChecked = isMulti
                    ? (selections[group.name] || []).includes(choice.name)
                    : selections[group.name] === choice.name;

                  return (
                    <label key={choice.name} className="option-choice-row">
                      <span className="option-choice-left">
                        <span
                          className={`option-radio ${isChecked ? "checked" : ""} ${
                            isMulti ? "is-checkbox" : ""
                          }`}
                        >
                          {isChecked && <span className="option-radio-dot" />}
                        </span>
                        <span className="option-choice-name">{choice.name}</span>
                      </span>
                      <span className="option-choice-right">
                        {choice.priceDelta > 0 && (
                          <span className="option-choice-price">
                            +₱{Number(choice.priceDelta).toFixed(2)}
                          </span>
                        )}
                        <input
                          type={isMulti ? "checkbox" : "radio"}
                          name={group.name}
                          checked={isChecked}
                          onChange={() =>
                            isMulti
                              ? handleMultiToggle(group.name, choice.name)
                              : handleSingleSelect(group.name, choice.name)
                          }
                          className="option-native-input"
                        />
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {error && <p className="product-modal-error">{error}</p>}
        </div>

        <div className="product-modal-footer">
          <button className="product-modal-add-btn" onClick={validateAndAdd}>
            <span>Add to Cart</span>
            <span>₱{totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
