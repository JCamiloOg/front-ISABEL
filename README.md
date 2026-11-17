# Calzado ISABEL — Frontend ERP & E-Commerce

Sistema web frontend para la gestión integral, distribución mayorista y comercialización de calzado de **Calzado ISABEL**. Diseñado con una interfaz moderna, responsive, accesible y soporte completo para modo claro y modo oscuro.

---

## 📌 Resumen del Proyecto

Este aplicativo web cubre tanto la experiencia pública de cara al cliente como el panel administrativo y operativo interno (ERP).

### Características Principales

1. **Portal Público y Catálogo (E-Commerce)**:
   - **Landing Page**: Presentación de marca, novedades, propuesta de valor y animaciones de entrada interactivas con AOS.
   - **Catálogo Interactivo**: Búsqueda por texto, filtrado por categorías, rangos de precio, marcas y tallas, con diseño adaptable para modo claro y oscuro.
   - **Ficha de Producto**: Vista detallada con galería de imágenes, selección de tallas, colores e información técnica.
   - **Gestión de Pedidos / Compras**: Flujo asistido por pasos para creación de pedidos y consulta de historial de compras para clientes registrados.

2. **Panel de Control y Gestión (Dashboard ERP)**:
   - **Gestión de Usuarios y Roles**: Administración de cuentas del personal (Administrador y Bodeguero) con asignación de roles, tipos de documento, control de estado mediante Switcher interactivo y modales de detalle y edición.
   - **Gestión de Clientes**: Registro, consulta, edición y seguimiento de clientes comerciales.
   - **Inventario y Productos**: Administración de catálogo, tallas, colores y existencias en bodega.
   - **Proveedores**: Directorio de proveedores, contactos y órdenes de suministro.
   - **Cajas Menores y Cuentas Bancarias**: Módulo financiero para registro y balance de cajas menores y cuentas operativas con métricas en tiempo real.
   - **Ventas y Pedidos Administrativos**: Trazabilidad y control del estado de órdenes mayoristas.

3. **Autenticación y Seguridad**:
   - Vistas de Inicio de Sesión, Registro y Recuperación de Contraseña con diseño editorial y validaciones integradas.

---

## 🚀 Tecnologías Utilizadas

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador**: [Vite](https://vite.dev/) (con soporte para React Compiler y Rolldown)
- **Estilos & Diseño**: [TailwindCSS v4](https://tailwindcss.com/)
- **Enrutamiento**: [TanStack Router](https://tanstack.com/router) (enrutamiento declarativo y seguro por tipos)
- **Animaciones**: [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/)
- **Iconografía**: [FontAwesome Icons](https://fontawesome.com/)
- **Alertas y Notificaciones**: [SweetAlert2](https://sweetalert2.github.io/)
- **Gráficos & Métricas**: [Recharts](https://recharts.org/)

---

## 📋 Requisitos Previos

Antes de instalar el proyecto, asegúrate de contar con lo siguiente en tu sistema:

- **Node.js**: versión `18.x` o superior (se recomienda `20.x` LTS o superior).
- **Gestor de paquetes**: `npm`, `pnpm` o `yarn` (`pnpm` o `npm` recomendado).
- **Git**: para clonar el repositorio.

---

## 🛠️ Guía de Instalación y Ejecución

Sigue estos pasos para clonar, instalar dependencias y levantar el proyecto en tu entorno local:

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/front-ISABEL.git
cd front-ISABEL
```

### 2. Instalar Dependencias

Utiliza tu gestor de paquetes preferido:

```bash
# Con npm
npm install

# Con pnpm
pnpm install

# Con yarn
yarn install
```

### 3. Iniciar el Servidor de Desarrollo

Inicia la aplicación en modo desarrollo con Hot Module Replacement (HMR):

```bash
npm run dev
# o con pnpm:
pnpm dev
```

El servidor iniciará localmente (habitualmente en `http://localhost:5173/`). Abre ese enlace en tu navegador para interactuar con la aplicación.

---

## 📦 Scripts Disponibles

En el directorio del proyecto puedes ejecutar:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local en `localhost:5173`. |
| `npm run build` | Compila TypeScript (`tsc -b`) y genera el paquete de producción optimizado en la carpeta `dist/`. |
| `npm run preview` | Previsualiza localmente el build de producción generado en `dist/`. |
| `npm run lint` | Ejecuta ESLint para analizar errores y estilos de código. |
| `npm run lint:fix` | Corrige de forma automática las advertencias y reglas de formato soportadas por ESLint. |

---

## 📂 Estructura Principal del Proyecto

```text
front-ISABEL/
├── public/                 # Recursos estáticos (logos, favicon, imágenes públicas)
├── src/
│   ├── @types/             # Definiciones globales de TypeScript (Users, Boxes, etc.)
│   ├── app/
│   │   └── routes/         # Configuración de rutas (Landing, Auth, Dashboard) con TanStack Router
│   ├── data/               # Conjuntos de datos mock y constantes iniciales
│   ├── features/           # Módulos organizados por dominio funcional:
│   │   ├── auth/           # Login, Registro, Recuperación de contraseña
│   │   ├── dashboard/      # Panel ERP (Usuarios, Clientes, Cajas, Proveedores, etc.)
│   │   └── landing/        # E-commerce (Inicio, Catálogo, Detalle de Producto, Pedidos)
│   ├── shared/             # Componentes reutilizables, hooks, layouts y utilidades
│   │   ├── components/     # Botones, Tablas, Modales, Inputs, Switchers
│   │   ├── layouts/        # Layouts compartidos (DashboardLayout, LandingLayout)
│   │   └── utils/          # Helpers de formato, alertas (SweetAlert2), etc.
│   ├── App.tsx             # Componente raíz e inicialización de librerías (AOS)
│   ├── main.tsx            # Punto de entrada de la aplicación
│   └── index.css           # Estilos globales y configuración de variables TailwindCSS
├── package.json            # Metadatos del proyecto y dependencias
├── tsconfig.json           # Configuración del compilador TypeScript
└── vite.config.ts          # Configuración del empaquetador Vite
```

---

## 🎨 Identidad Visual y Tema

El proyecto cuenta con un sistema de diseño institucional personalizado para **Calzado ISABEL**:
- **Navy Principal**: `#0E2347` (`brand-navy`)
- **Azul Real**: `#2B62D9` (`brand-royal`)
- **Celeste / Acento**: `#52A5E8` (`brand-sky`)
- Soporte dinámico para **Modo Claro** y **Modo Oscuro** en todas sus vistas.
