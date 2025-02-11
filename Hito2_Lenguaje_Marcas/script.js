document.addEventListener("DOMContentLoaded", function () {
    fetch("datosfinales.json")
        .then(response => response.json())
        .then(data => {
            if (document.querySelector("#tablaClientes")) {
                mostrarClientes(data);
            }
            if (document.querySelector("#tablaPedidos")) {
                mostrarPedidos(data);
            }
            if (document.querySelector("#tablaPedidosFiltrados")) {
                mostrarPedidosFiltrados(data);
            }
            if (document.querySelector("#selectCliente")) {
                poblarMenuClientes(data);
            }
        })
        .catch(error => console.error("Error cargando el JSON", error));
});


function mostrarPedidos(data) {
  let tbody = document.querySelector("#tablaPedidos tbody");
  Object.keys(data).forEach(year => {
      Object.keys(data[year]).forEach(trimestre => {
          data[year][trimestre].forEach(pedido => {
              let fila = `<tr>
                  <td>${pedido.pedido}</td>
                  <td>${pedido.fecha_compra}</td>
                  <td>${pedido.fecha_entrega}</td>
                  <td>${pedido.total_factura}€</td>
                  <td>${pedido.cliente.nombre} ${pedido.cliente.apellidos}</td>
                  <td>${pedido.productos.map(p => `${p.nombre_producto} (${p.unidades}x)`).join(", ")}</td>
              </tr>`;
              tbody.innerHTML += fila;
          });
      });
  });
}

function mostrarPedidosFiltrados(data) {
    let tbody = document.querySelector("#tablaPedidosFiltrados tbody");
    tbody.innerHTML = "";

    let pedidosFiltrados = [...data["2023"]["Q1"], ...data["2024"]["Q4"]];
    
    pedidosFiltrados.forEach(pedido => {
        let fila = `<tr>
            <td>${pedido.pedido}</td>
            <td>${pedido.fecha_compra}</td>
            <td>${pedido.fecha_entrega}</td>
            <td>${pedido.total_factura}€</td>
            <td>${pedido.cliente.nombre} ${pedido.cliente.apellidos}</td>
            <td>${pedido.productos.map(p => `${p.nombre_producto} (${p.unidades}x)`).join(", ")}</td>
        </tr>`;
        tbody.innerHTML += fila;
    });
}

function mostrarClientes(data) {
  let tbody = document.querySelector("#tablaClientes tbody");
  let clientesUnicos = new Set();
  Object.keys(data).forEach(year => {
      Object.keys(data[year]).forEach(trimestre => {
          data[year][trimestre].forEach(pedido => {
              let clienteId = pedido.cliente.email;
              if (!clientesUnicos.has(clienteId)) {
                  clientesUnicos.add(clienteId);
                  let fila = `<tr>
                      <td>${pedido.cliente.nombre}</td>
                      <td>${pedido.cliente.apellidos}</td>
                      <td>${pedido.cliente.telefono}</td>
                      <td>${pedido.cliente.direccion.calle}, ${pedido.cliente.direccion.ciudad}, ${pedido.cliente.direccion.codigo_postal}, ${pedido.cliente.direccion.provincia}</td>
                      <td>${pedido.cliente.email}</td>
                  </tr>`;
                  tbody.innerHTML += fila;
              }
          });
      });
  });
}

function poblarMenuClientes(data) {
  let selectClientes = document.querySelector("#selectCliente");
  let clientesUnicos = new Map();

  Object.keys(data).forEach(year => {
      Object.keys(data[year]).forEach(trimestre => {
          data[year][trimestre].forEach(pedido => {
              let clienteId = pedido.cliente.email;
              if (!clientesUnicos.has(clienteId)) {
                  clientesUnicos.set(clienteId, pedido.cliente);
                  let option = document.createElement("option");
                  option.value = clienteId;
                  option.textContent = `${pedido.cliente.nombre} ${pedido.cliente.apellidos}`;
                  selectClientes.appendChild(option);
              }
          });
      });
  });

  selectClientes.addEventListener("change", function () {
      generarFactura(data, this.value);
  });
}

function generarFactura(data, clienteEmail) {
  let pedidoSeleccionado;

  Object.keys(data).forEach(year => {
      Object.keys(data[year]).forEach(trimestre => {
          data[year][trimestre].forEach(pedido => {
              if (pedido.cliente.email === clienteEmail) {
                  pedidoSeleccionado = pedido;
              }
          });
      });
  });

  if (pedidoSeleccionado) {
      document.querySelector("#clienteFactura").textContent = pedidoSeleccionado.cliente.nombre + " " + pedidoSeleccionado.cliente.apellidos;
      document.querySelector("#productoFactura").textContent = pedidoSeleccionado.productos.map(p => `${p.nombre_producto} (${p.unidades}x)`).join(", ");
      document.querySelector("#totalFactura").textContent = pedidoSeleccionado.total_factura + "€";
  }
}
