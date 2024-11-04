import React, { useState } from 'react';

const ProductItem = ({ producto, onAddToCart }) => {
  const [cantidad, setCantidad] = useState(1);

  return (
    <div className="product-item">
      <p>{producto.nombre} - ${producto.precio}</p>
      <input
        type="number"
        min="1"
        max={producto.stock}
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
      />
      <button onClick={() => onAddToCart(producto, cantidad)}>Agregar</button>
    </div>
  );
};

export default ProductItem;
