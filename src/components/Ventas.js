import React, { useState, useEffect } from 'react';
import './Ventas.css';

const Ventas = ({ onLogout }) => {
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [cliente, setCliente] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detalleCompra, setDetalleCompra] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [ordenNombre, setOrdenNombre] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [nombreClienteFiltro, setNombreClienteFiltro] = useState('');
  const [historialFiltrado, setHistorialFiltrado] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [comprasPorPagina] = useState(5);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://localhost:30013/api/productos');
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    };
    fetchProductos();
  }, []);

  const actualizarHistorial = async () => {
    try {
      const response = await fetch('http://localhost:30013/api/ventas/get-ventas');
      const data = await response.json();
      if (data.ventas && Array.isArray(data.ventas)) {
        setHistorial(data.ventas);
        console.log('Historial actualizado:', data.ventas);
      } else {
        console.error('Error: la respuesta no contiene un array de ventas');
      }
    } catch (error) {
      console.error('Error al obtener el historial de ventas:', error);
    }
  };

  useEffect(() => {
    actualizarHistorial();
  }, []);

  useEffect(() => {
    let filteredHistorial = [...historial];
  
    if (filtro === 'nombreCliente' && nombreClienteFiltro) {
      filteredHistorial = filteredHistorial.filter((compra) =>
        compra.nombre_cliente.toLowerCase().startsWith(nombreClienteFiltro.toLowerCase())
      );
    }
  
    if (filtro === 'fecha' && fechaDesde && fechaHasta) {
      const fechaDesdeObj = new Date(fechaDesde);
      const fechaHastaObj = new Date(fechaHasta);
  
      filteredHistorial = filteredHistorial.filter((compra) => {
        const fechaCompra = new Date(compra.fecha);
        return fechaCompra >= fechaDesdeObj && fechaCompra <= fechaHastaObj;
      });
    }
  
    switch (filtro) {
      case 'nombreCliente':
        filteredHistorial = filteredHistorial.sort((a, b) =>
          ordenNombre === 'asc'
            ? a.nombre_cliente.localeCompare(b.nombre_cliente)
            : b.nombre_cliente.localeCompare(a.nombre_cliente)
        );
        break;
      case 'nombreVendedor':
        filteredHistorial = filteredHistorial.sort((a, b) =>
          a.nombre_vendedor.localeCompare(b.nombre_vendedor)
        );
        break;
      default:
        break;
    }
  
    // Ordenar por fecha en orden descendente
    filteredHistorial = filteredHistorial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  
    setHistorialFiltrado(filteredHistorial);
  }, [historial, filtro, ordenNombre, fechaDesde, fechaHasta, nombreClienteFiltro]);
  
  
  

  const agregarAlCarrito = () => {
    if (!cliente) {
      alert('Por favor, ingrese el nombre del cliente');
      return;
    }

    if (!productoSeleccionado) {
      alert('Por favor, selecciona un producto');
      console.log("Error: Producto seleccionado es null o undefined");
      return;
    }

    const producto = productos.find((p) => p.id_producto === productoSeleccionado.id_producto);
    if (!producto) {
      alert('Producto no encontrado');
      return;
    }

    if (producto.stock < cantidad) {
      alert('Producto no disponible');
      return;
    }

    const nuevoProducto = { ...producto, cantidad };
    console.log("Nuevo producto agregado al carrito:", nuevoProducto);
    setCarrito((prevCarrito) => {
      const nuevoCarrito = [...prevCarrito, nuevoProducto];
      console.log("Carrito actualizado:", nuevoCarrito);
      return nuevoCarrito;
    });
    setTotal((prevTotal) => prevTotal + producto.precio * cantidad);

    // Actualizar el stock del producto
    setProductos((prevProductos) =>
      prevProductos.map((p) =>
        p.id_producto === producto.id_producto ? { ...p, stock: p.stock - cantidad } : p
      )
    );

    // Reiniciar la selección del producto y la cantidad
    setProductoSeleccionado(null);
    setCantidad(1);
  };

  const abrirModal = () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío.');
      return;
    }
    setShowModal(true);
  };

  const aceptarCompra = async () => {
    const user = localStorage.getItem('user');
    console.log("user_id", JSON.parse(user).id_vendedor);
    const nuevaCompra = {
      nombre_cliente: cliente,
      pedidos: carrito.map((x) => ({ id_producto: x.id_producto, cantidad: x.cantidad })),
      total: carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
      id_vendedor: JSON.parse(user).id_vendedor
    };
    console.log("Nueva compra:", nuevaCompra);

    // Enviar los datos al backend
    try {
      const response = await fetch('http://localhost:30013/api/ventas/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaCompra),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Compra guardada correctamente:', data);

        // Actualizar el historial de compras después de una compra exitosa
        await actualizarHistorial();

        // Limpiar el carrito y otros estados
        setCarrito([]);
        setTotal(0);
        setShowModal(false);
        setCliente('');
        setFechaCompra('');
      } else {
        console.error('Error al guardar la compra');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud al backend:', error);
    }
  };

  const rechazarCompra = () => {
    setProductos((prevProductos) =>
      prevProductos.map((p) => {
        const itemCarrito = carrito.find((item) => item.id_producto === p.id_producto);
        return itemCarrito ? { ...p, stock: p.stock + itemCarrito.cantidad } : p;
      })
    );

    setCarrito([]);
    setTotal(0);
    setShowModal(false);
  };

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  const handleOrdenNombreChange = (e) => {
    setOrdenNombre(e.target.value);
  };

  // Paginación
  const handlePaginaSiguiente = () => {
    if (paginaActual * comprasPorPagina < historialFiltrado.length) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const handlePaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };
  

  const comprasPorPaginaActual = historialFiltrado.slice(
    (paginaActual - 1) * comprasPorPagina,
    paginaActual * comprasPorPagina
  );
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const mostrarDetalleCompra = async (compraId) => {
    setLoadingDetalle(true);
    try {
      const response = await fetch(`http://localhost:30013/api/ventas/get-venta/${compraId}`);
      const data = await response.json();
      if (response.ok) {
        setDetalleCompra(data.venta);
        setShowDetalleModal(true);
      } else {
        console.error('Error al obtener los detalles de la compra:', data.message);
      }
    } catch (error) {
      console.error('Error al realizar la solicitud al backend:', error);
    }
    setLoadingDetalle(false);
  };
  
  
  // Renderiza los detalles en el modal
  {showDetalleModal && detalleCompra && (
    <div className="modal">
      <h3>Detalles de la compra</h3>
      <p>Cliente: {detalleCompra.nombre_cliente}</p>
      <p>Fecha: {detalleCompra.fecha}</p>
      <p>Total: {detalleCompra.total}</p>
      <ul>
        {detalleCompra.pedidos.map((producto, index) => (
          <li key={index}>
            Producto: {producto.producto} - Cantidad: {producto.cantidad} - Precio unitario: {producto.precio_unitario} - Total: {producto.total}
          </li>
        ))}
      </ul>
      <button onClick={() => setShowDetalleModal(false)}>Cerrar</button>
    </div>
  )}
  

  return (
    <div className="ventas-layout">
      <div className="ventas-container">
        <header className="ventas-header">
          <button onClick={onLogout} className="home-button">
            🏠
          </button>
          <h2>Módulo de Ventas</h2>
        </header>

        <div className="input-section">
          <input
            type="text"
            placeholder="Nombre del Cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />
        </div>

        <div className="fecha-compra">
  <label>Fecha de compra: {new Date().toLocaleString('es-CO')}</label>
</div>

        <div className="producto-section">
          <select
            value={productoSeleccionado ? productoSeleccionado.id_producto : ""}
            onChange={(e) => {
              const producto = productos.find((p) => p.id_producto === parseInt(e.target.value, 10));
              console.log("Producto seleccionado:", producto);
              setProductoSeleccionado(producto);
            }}
          >
            <option value="">Selecciona un producto</option>
            {productos.map((producto) => (
              <option key={producto.id_producto} value={producto.id_producto}>
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
        </div>

        <div className="button-section">
          <button onClick={agregarAlCarrito}>Agregar al carrito</button>
        </div>

        <h3>Carrito de Compras</h3>
        <ul>
          {carrito.map((item, index) => (
            <li key={index}>
              {item.nombre} - Cantidad: {item.cantidad} - Total: {item.precio * item.cantidad}
            </li>
          ))}
        </ul>

        <h3>Total: {total}</h3>
        <div className="finalizar-compra">
          <button onClick={abrirModal}>Finalizar Compra</button>
        </div>

        {showModal && (
          <div className="modal">
            <h3>Confirmar compra</h3>
            <p>¿Desea aceptar la compra?</p>
            <button onClick={aceptarCompra}>Aceptar</button>
            <button onClick={rechazarCompra}>Rechazar</button>
          </div>
        )}
      </div>

      <div className="filtros">
        <h3>Filtrar Historial</h3>
        <select value={filtro} onChange={handleFiltroChange}>
          <option value="">Selecciona un filtro</option>
          <option value="nombreCliente">Nombre del Cliente</option>
          <option value="fecha">Fecha de Compra</option>
        </select>
        {filtro === 'nombreCliente' && (
          <input
            type="text"
            placeholder="Filtrar por cliente"
            value={nombreClienteFiltro}
            onChange={(e) => setNombreClienteFiltro(e.target.value)}
          />
        )}

        {filtro === 'fecha' && (
          <>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </>
        )}

        <div className="historial">
          <h3>Historial de Compras</h3>
          <table>
            <thead>
              <tr>
                <th>Nombre de Comprador</th>
                <th>Fecha</th>
                <th>Nombre de Vendedor</th>
                <th>Total</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
            {comprasPorPaginaActual.map((compra, index) => (
    < tr key={index}>
      <td>{compra.nombre_cliente}</td>
      <td>{compra.fecha}</td>
      <td>{compra.vendedor}</td>
      <td>{compra.pedidos.reduce((acc, el) => acc + el.total, 0)}</td>
      <td>
        <button
  className="ver-detalles-btn"
  onClick={() => mostrarDetalleCompra(compra.id_venta)}
>
  {loadingDetalle ? 'Cargando...' : '👁️'}
</button>

      </td>
    </tr>
  ))}
</tbody>

          </table>

          <div className="paginacion">
            <button onClick={handlePaginaAnterior} disabled={paginaActual === 1}>
              Anterior
            </button>
            <button
              onClick={handlePaginaSiguiente}
              disabled={paginaActual * comprasPorPagina >= historialFiltrado.length}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {showDetalleModal && (
  <div className="modal">
    {loadingDetalle ? (
      <p>Cargando detalles...</p>
    ) : detalleCompra ? (
      <div>
        <h3>Detalles de la compra</h3>
        <p>Cliente: {detalleCompra.nombre_cliente}</p>
        <p>Fecha: {new Date(detalleCompra.fecha).toLocaleDateString()}</p>
        <ul>
          {detalleCompra.pedidos.map((producto, index) => (
            <li key={index}>
              Producto: {producto.producto} - Cantidad: {producto.cantidad} - Precio unitario: {producto.precio_unitario}
            </li>
          ))}
        </ul>
        <h4>Total: {detalleCompra.pedidos.reduce((acc, el) => acc + el.total, 0)}</h4>
        <button onClick={() => setShowDetalleModal(false)}>Cerrar</button>
      </div>
    ) : (
      <p>Detalles no disponibles</p>
    )}
  </div>
)}

    </div>
  );
};

export default Ventas;

