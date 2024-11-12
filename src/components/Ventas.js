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
  const [showDetalleModal, setShowDetalleModal] = useState(false); // Nuevo estado para mostrar el detalle
  const [detalleCompra, setDetalleCompra] = useState(null); // Estado para almacenar la compra seleccionada
  const [filtro, setFiltro] = useState('');
  const [ordenNombre, setOrdenNombre] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [nombreClienteFiltro, setNombreClienteFiltro] = useState('');
  const [historialFiltrado, setHistorialFiltrado] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1); // Página actual
  const [comprasPorPagina] = useState(5); // Número de compras por página

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        // Reemplaza esta URL con la URL real de tu backend
        const response = await fetch('http://localhost:30013/api/productos');
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    };
    fetchProductos();
  }, []);
  
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await fetch('http://localhost:30013/api/ventas/get-ventas');
        const data = await response.json();
        console.log('Datos recibidos:', data);
  
        // Verificar si los datos contienen el campo 'nombre_cliente'
        if (data.ventas && Array.isArray(data.ventas)) {
          data.ventas.forEach(venta => {
            if (!venta.nombre_cliente) {
              console.warn(`Venta con id ${venta.id_venta} tiene 'nombre_cliente' como undefined o null`);
            }
          });
          setHistorial(data.ventas);
        }
      } catch (error) {
        console.error('Error al obtener el historial de ventas:', error);
      }
    };
  
    fetchHistorial();
  }, []);
  

useEffect(() => {
  const fetchHistorial = async () => {
    try {
      const response = await fetch('http://localhost:30013/api/ventas/get-ventas');
      const data = await response.json();
      console.log('Datos del historial de ventas:', data);  // Verifica los datos que estás recibiendo

      if (data.ventas && Array.isArray(data.ventas)) {
        setHistorial(data.ventas);  // Ahora accedemos a data.ventas
      } else {
        console.error('Error: la respuesta no contiene un array de ventas');
        setHistorial([]);  // Si no contiene ventas, establecer historial vacío
      }
    } catch (error) {
      console.error('Error al obtener el historial de ventas:', error);
      setHistorial([]);  // Si hay error, establecer historial vacío
    }
  };
  fetchHistorial();
}, []);

  useEffect(() => {
    let filteredHistorial = [...historial];

    if (filtro === 'nombreCliente' && nombreClienteFiltro) {
      filteredHistorial = filteredHistorial.filter((compra) =>
        compra.cliente.toLowerCase().includes(nombreClienteFiltro.toLowerCase())
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
            ? a.cliente.localeCompare(b.cliente)
            : b.cliente.localeCompare(a.cliente)
        );
        break;
      case 'nombreVendedor':
        filteredHistorial = filteredHistorial.sort((a, b) =>
          a.vendedor.localeCompare(b.vendedor)
        );
        break;
      default:
        break;
    }

    setHistorialFiltrado(filteredHistorial);
  }, [historial, filtro, ordenNombre, fechaDesde, fechaHasta, nombreClienteFiltro]);

  const agregarAlCarrito = () => {
    if (!cliente) {
      alert('Por favor, ingrese el nombre del cliente');
      return;
    }

    if (!productoSeleccionado) {
      alert('Por favor, selecciona un producto');
      return;
    }

    const producto = productos.find((p) => p.id === productoSeleccionado.id);
    if (producto.stock < cantidad) {
      alert('Producto no disponible');
      return;
    }

    const nuevoProducto = { ...producto, cantidad };
    setCarrito([...carrito, nuevoProducto]);
    setTotal(total + producto.precio * cantidad);

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
    const nuevaCompra = {
      cliente,
      productos: carrito,
      fecha: fechaCompra || new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
      total,
      vendedor: 'Vendedor 1',
    };
    setHistorial([nuevaCompra, ...historial].slice(0, 10)); // Limitar a las 10 compras más recientes

    setCarrito([]);
    setTotal(0);
    setShowModal(false);
    setCliente('');
    setFechaCompra('');
  };

  const rechazarCompra = () => {
    setProductos((prevProductos) =>
      prevProductos.map((p) => {
        const itemCarrito = carrito.find((item) => item.id === p.id);
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

  const mostrarDetalleCompra = (compra) => {
    setDetalleCompra(compra);
    setShowDetalleModal(true);
  };

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

        {/* Fecha de compra antes de la selección del producto */}
        <div className="fecha-compra">
          <label>Fecha de compra: </label>
          <input
            type="date"
            value={fechaCompra}
            onChange={(e) => setFechaCompra(e.target.value)}
          />
        </div>

        {/* Selección de producto y cantidad */}
        <div className="producto-section">
          <select
            onChange={(e) => {
              const producto = productos.find((p) => p.nombre === e.target.value);
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

      {/* Filtros */}
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
                <tr key={index}>
                  <td>{compra.cliente}</td>
                  <td>{compra.fecha}</td>
                  <td>{compra.vendedor}</td>
                  <td>{compra.total}</td>
                  <td>
                    <button
                      className="ver-detalles-btn"
                      onClick={() => mostrarDetalleCompra(compra)}
                    >
                      👁️
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

      {/* Modal de detalle de compra */}
      {showDetalleModal && detalleCompra && (
        <div className="modal">
          <h3>Detalles de la compra</h3>
          <p>Cliente: {detalleCompra.cliente}</p>
          <p>Fecha: {detalleCompra.fecha}</p>
          <p>Total: {detalleCompra.total}</p>
          <ul>
            {detalleCompra.productos.map((producto, index) => (
              <li key={index}>
                {producto.nombre} - Cantidad: {producto.cantidad} - Precio: {producto.precio}
              </li>
            ))}
          </ul>
          <button onClick={() => setShowDetalleModal(false)}>Cerrar</button>
        </div>
      )}
    </div>
  );
};

export default Ventas;
  