# Sistema de Gestión Electrónica

El Sistema de Gestión Electrónica es una aplicación web desarrollada para la administración integral de ventas, inventarios y procesos internos en negocios pequeños y medianos. Implementa un flujo completo que incluye manejo de productos, clientes, proveedores, usuarios y facturación.

Este proyecto fue construido bajo una arquitectura MVC, utilizando tecnologías web modernas y buenas prácticas de organización de código.

---

## Tecnologías utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript
- TypeScript

### Backend
- PHP (MVC)
- SQL (MySQL)
- Generación de PDF con FPDF

### Otras herramientas
- XAMPP
- Git y GitHub

---

## Funcionalidades principales

- Gestión completa de productos (CRUD)
- Módulo de clientes
- Módulo de proveedores
- Control de usuarios y roles
- Proceso de facturación
- Generación de tickets y reportes en PDF
- Inicio de sesión con control de sesiones
- Interfaz diferenciada para administrador y empleado

---

## Estructura del proyecto

electronica                                
├─ controlador                             
│  ├─ CategoriaController.php              
│  ├─ getCategorias.php                    
│  ├─ getClientes.php                      
│  ├─ getProductos.php                     
│  ├─ getProveedores.php                   
│  ├─ LoginController.php                  
│  ├─ logout.php                           
│  ├─ Producto.php                         
│  ├─ ProductoController.php               
│  ├─ Proveedor.php                        
│  ├─ ReporteClienteController.php         
│  ├─ Usuario.php                          
│  └─ VentaPDF.php                         
├─ css                                     
│  ├─ js                                   
│  │  ├─ cargarCategorias.js               
│  │  ├─ categorias.js                     
│  │  ├─ ControllerMenu.js                 
│  │  ├─ facturacion-core.js               
│  │  ├─ facturacion.js                    
│  │  ├─ filtros-productos.js              
│  │  ├─ FormMenu.js                       
│  │  ├─ InterGestionarCliente.js          
│  │  ├─ InterGestionarProductos.js        
│  │  ├─ InterGestionarProveedores.js      
│  │  ├─ InterGestionarUsuarios.js         
│  │  ├─ login.js                          
│  │  ├─ navMenu.js                        
│  │  ├─ reporte_cliente.js                
│  │  ├─ reporte_producto.js               
│  │  └─ ticketPDF.js                      
│  ├─ categorias.css                       
│  ├─ FormMenu.css                         
│  ├─ InterFacturar.css                    
│  ├─ InterGestionarCliente.css            
│  ├─ InterGestionarProducto.css           
│  ├─ InterGestionarProveedor.css          
│  ├─ InterGestionarUsuario.css            
│  └─ login.css                            
├─ img                                     
│  └─ logoSYS.png                          
├─ logs                                    
│  └─ login.log                            
├─ modelo                                  
│  ├─ Cliente.php                          
│  ├─ conexion.php                         
│  └─ usuario.php                          
├─ Vista                                   
│  ├─ categorias.html                      
│  ├─ FormMenu.html                        
│  ├─ InterFacturar.html                   
│  ├─ InterFacturarEmpleado.html           
│  ├─ InterGestionarCliente.html           
│  ├─ InterGestionarClienteEmpleado.html   
│  ├─ InterGestionarProducto.html          
│  ├─ InterGestionarProductoEmpleado.html  
│  ├─ InterGestionarProveedor.html         
│  ├─ InterGestionarUsuario.html           
│  ├─ menu_empleado.html                   
│  ├─ navbar.html                          
│  └─ navbarEmpleado.html                  
├─ DB_SitInvComp.sql                       
├─ index.php                               
└─ LICENSE                                 
