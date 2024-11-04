import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductItem from './ProductItem';


const Ventas = () => {
    const [productos, setProductos] = useState([]);
    const [total, setTotal] = useState(0);
    const [cliente, setCliente] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [carrito, setCarrito] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [showModal, setShowModal] = useState(false);
  
    useEffect(() => {
      setProductos([
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 },
        { id: 2, nombre: 'Producto 2', precio: 200, stock: 5 },
        { id: 3, nombre: 'Producto 3', precio: 300, stock: 3 },
      ]);
    }, []);
  
    const agregarAlCarrito = () => {
      if (!productoSeleccionado) {
        alert('Por favor, selecciona un producto');
        return;
      }
  
      const producto = productos.find((p) => p.id === productoSeleccionado.id);
      if (producto.stock < cantidad) {
        alert('Producto no disponible');
        return;
      }
  
      // Agrega el producto al carrito y reduce el stock temporalmente
      const nuevoProducto = { ...producto, cantidad };
      setCarrito([...carrito, nuevoProducto]);
      setTotal(total + producto.precio * cantidad);
  
      // Reduce temporalmente el stock del producto seleccionado
      setProductos((prevProductos) =>
        prevProductos.map((p) =>
          p.id === producto.id ? { ...p, stock: p.stock - cantidad } : p
        )
      );
    };
  
    const abrirModal = () => {
      if (carrito.length === 0) {
        alert('El carrito está vacío.');
        return;
      }
      setShowModal(true);
    };
  
    const aceptarCompra = () => {
      // Añadir compra al historial
      const nuevaCompra = {
        cliente,
        productos: carrito,
        fecha: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
        total,
      };
      setHistorial([nuevaCompra, ...historial].slice(0, 10));
  
      // Limpiar carrito y estado
      setCarrito([]);
      setTotal(0);
      setShowModal(false);
      setCliente('');
    };
  
    const rechazarCompra = () => {
      // Restablecer el stock de los productos
      setProductos((prevProductos) =>
        prevProductos.map((p) => {
          const itemCarrito = carrito.find((item) => item.id === p.id);
          if (itemCarrito) {
            return { ...p, stock: p.stock + itemCarrito.cantidad };
          }
          return p;
        })
      );
  
      // Limpiar el carrito y cerrar modal
      setCarrito([]);
      setTotal(0);
      setShowModal(false);
    };
  
    return (
      <div className="ventas-container">
        <h2>Módulo de Ventas</h2>
  
        <input 
          type="text" 
          placeholder="Nombre del Cliente" 
          value={cliente} 
          onChange={(e) => setCliente(e.target.value)} 
        />
  
        <h4>Fecha: {new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</h4>
  
        <select
          onChange={(e) => {
            const producto = productos.find(p => p.nombre === e.target.value);
            setProductoSeleccionado(producto);
          }}
        >
          <option value="">Selecciona un producto</option>
          {productos.map((producto) => (
            <option key={producto.id} value={producto.nombre}>
              {producto.nombre} - Precio: {producto.precio} - Stock: {producto.stock}
            </option>
          ))}
        </select>
  
        <input 
          type="number" 
          value={cantidad} 
          onChange={(e) => setCantidad(Number(e.target.value))} 
          min="1" 
        />
  
        <button onClick={agregarAlCarrito}>Agregar al carrito</button>
  
        <h3>Carrito de Compras</h3>
        <ul>
          {carrito.map((item, index) => (
            <li key={index}>
              {item.nombre} - Cantidad: {item.cantidad} - Total: {item.precio * item.cantidad}
            </li>
          ))}
        </ul>
  
        <h3>Total: {total}</h3>
        <button onClick={abrirModal}>Finalizar Compra</button>
  
        {showModal && (
          <div className="modal">
            <h3>Confirmar compra</h3>
            <p>¿Desea aceptar la compra?</p>
            <button onClick={aceptarCompra}>Aceptar</button>
            <button onClick={rechazarCompra}>Rechazar</button>
          </div>
        )}
  
        <h3>Historial de Compras</h3>
        <ul>
          {historial.map((compra, index) => (
            <li key={index}>
              <strong>Cliente:</strong> {compra.cliente} | <strong>Fecha:</strong> {compra.fecha} | <strong>Total:</strong> {compra.total}
              <ul>
                {compra.productos.map((producto, i) => (
                  <li key={i}>
                    {producto.nombre} - Cantidad: {producto.cantidad}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default Ventas;