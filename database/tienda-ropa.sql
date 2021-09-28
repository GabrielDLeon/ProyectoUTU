-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-09-2021 a las 00:52:28
-- Versión del servidor: 10.4.20-MariaDB
-- Versión de PHP: 8.0.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tienda-ropa`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `categoria` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`categoria`) VALUES
('accesorio'),
('calzado'),
('jeans'),
('polo'),
('remera');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colores`
--

CREATE TABLE `colores` (
  `color` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `colores`
--

INSERT INTO `colores` (`color`) VALUES
('Azul'),
('Blanco'),
('Negro'),
('Rojo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuentas`
--

CREATE TABLE `cuentas` (
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tipo` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `cuentas`
--

INSERT INTO `cuentas` (`email`, `password`, `tipo`) VALUES
('alan@gmail.com', '321', 'personal'),
('mitienda@gmail.com', '12345', 'empresa'),
('nombreempresa@gmail.com', '$2a$08$3RD65FZ2Aww8Cm/MAeJuF.k5C7Qg05ZX06ThOZLSdm4J3zn1NT16O', 'empresa'),
('otratienda@gmail.com', '54618', 'empresa'),
('tienda@gmail.com', '$2a$08$0inQ4GGKTHgF2dXeRlVACe6byIj8axZZgsO0R6D2TeyI//ReDvlp2', 'empresa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuenta_empresa`
--

CREATE TABLE `cuenta_empresa` (
  `email` varchar(255) NOT NULL,
  `RUT` int(12) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(9) NOT NULL,
  `razonSocial` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `cuenta_empresa`
--

INSERT INTO `cuenta_empresa` (`email`, `RUT`, `nombre`, `direccion`, `telefono`, `razonSocial`) VALUES
('tienda@gmail.com', 123, 'tienda', '', '', 'SRL'),
('mitienda@gmail.com', 4000, 'Zapatería de zapatos', '25 agosto', '45673098', 'SRL'),
('nombreempresa@gmail.com', 134124124, 'nombre emprersa', '', '', 'srl');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuenta_personal`
--

CREATE TABLE `cuenta_personal` (
  `email` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `cuenta_personal`
--

INSERT INTO `cuenta_personal` (`email`, `nombre`) VALUES
('alan@gmail.com', 'Alan');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `curvas`
--

CREATE TABLE `curvas` (
  `talle` varchar(255) NOT NULL,
  `publicacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `curvas`
--

INSERT INTO `curvas` (`talle`, `publicacion`) VALUES
('35', 1),
('36', 1),
('37', 1),
('38', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `enlaces`
--

CREATE TABLE `enlaces` (
  `tipo` varchar(255) NOT NULL,
  `URL` varchar(255) NOT NULL,
  `propietario` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `enlaces_tipos`
--

CREATE TABLE `enlaces_tipos` (
  `plataforma` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `enlaces_tipos`
--

INSERT INTO `enlaces_tipos` (`plataforma`) VALUES
('Facebook'),
('Instagram'),
('Whatsapp');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `generos`
--

CREATE TABLE `generos` (
  `genero` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `generos`
--

INSERT INTO `generos` (`genero`) VALUES
('Femenino'),
('Masculino');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marcas`
--

CREATE TABLE `marcas` (
  `marca` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `marcas`
--

INSERT INTO `marcas` (`marca`) VALUES
('Adidas'),
('Chanel'),
('Genérica'),
('Gucci'),
('Nike');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materiales`
--

CREATE TABLE `materiales` (
  `material` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `materiales`
--

INSERT INTO `materiales` (`material`) VALUES
('Algodón'),
('Cuero'),
('Pieles'),
('Poliéster'),
('Seda');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfil`
--

CREATE TABLE `perfil` (
  `email` varchar(255) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preguntas`
--

CREATE TABLE `preguntas` (
  `idPregunta` int(11) NOT NULL,
  `mensaje` varchar(255) NOT NULL,
  `fechaPregunta` date NOT NULL,
  `horaPregunta` time NOT NULL,
  `remitente` varchar(255) NOT NULL,
  `publicacion` int(11) NOT NULL,
  `respuesta` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `preguntas`
--

INSERT INTO `preguntas` (`idPregunta`, `mensaje`, `fechaPregunta`, `horaPregunta`, `remitente`, `publicacion`, `respuesta`) VALUES
(1, 'Hola quería realizar una consulta sobre este producto, gracias.', '2021-09-05', '09:30:00', 'alan@gmail.com', 1, 'No'),
(2, 'No me respondieron la duda que tenía. Mal servicio, muy malo!', '2021-09-07', '19:00:00', 'alan@gmail.com', 1, '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `idProducto` int(11) NOT NULL,
  `categoria` varchar(255) NOT NULL,
  `genero` varchar(255) NOT NULL,
  `material` varchar(255) NOT NULL,
  `marca` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`idProducto`, `categoria`, `genero`, `material`, `marca`) VALUES
(2, 'calzado', 'Masculino', 'Cuero', 'Genérica'),
(3, 'remera', 'Femenino', 'Algodón', 'Adidas'),
(4, 'remera', 'Masculino', 'Pieles', 'Gucci'),
(5, 'accesorio', 'Masculino', 'Poliéster', 'Chanel');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicacion`
--

CREATE TABLE `publicacion` (
  `nroPublicacion` int(11) NOT NULL,
  `precio` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `producto` int(11) NOT NULL,
  `vendedor` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `publicacion`
--

INSERT INTO `publicacion` (`nroPublicacion`, `precio`, `titulo`, `descripcion`, `producto`, `vendedor`) VALUES
(1, 1400, 'Championes de cuero', 'Estos championes de cuero son lo mejor del mundo, compralos 50 porciento de descuento', 2, 'mitienda@gmail.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguir`
--

CREATE TABLE `seguir` (
  `seguidor` varchar(255) NOT NULL,
  `seguido` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `seguir`
--

INSERT INTO `seguir` (`seguidor`, `seguido`) VALUES
('alan@gmail.com', 'mitienda@gmail.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `talles`
--

CREATE TABLE `talles` (
  `talle` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `talles`
--

INSERT INTO `talles` (`talle`) VALUES
('35'),
('36'),
('37'),
('38'),
('39'),
('40');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`categoria`);

--
-- Indices de la tabla `colores`
--
ALTER TABLE `colores`
  ADD PRIMARY KEY (`color`);

--
-- Indices de la tabla `cuentas`
--
ALTER TABLE `cuentas`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `cuenta_empresa`
--
ALTER TABLE `cuenta_empresa`
  ADD PRIMARY KEY (`RUT`),
  ADD KEY `cuenta_empresa_ibfk_1` (`email`);

--
-- Indices de la tabla `cuenta_personal`
--
ALTER TABLE `cuenta_personal`
  ADD KEY `cuenta_personal_ibfk_1` (`email`);

--
-- Indices de la tabla `curvas`
--
ALTER TABLE `curvas`
  ADD PRIMARY KEY (`talle`,`publicacion`),
  ADD KEY `curvas_ibfk_1` (`publicacion`);

--
-- Indices de la tabla `enlaces`
--
ALTER TABLE `enlaces`
  ADD PRIMARY KEY (`tipo`,`propietario`),
  ADD KEY `enlaces_ibfk_1` (`propietario`);

--
-- Indices de la tabla `enlaces_tipos`
--
ALTER TABLE `enlaces_tipos`
  ADD PRIMARY KEY (`plataforma`);

--
-- Indices de la tabla `generos`
--
ALTER TABLE `generos`
  ADD PRIMARY KEY (`genero`);

--
-- Indices de la tabla `marcas`
--
ALTER TABLE `marcas`
  ADD PRIMARY KEY (`marca`);

--
-- Indices de la tabla `materiales`
--
ALTER TABLE `materiales`
  ADD PRIMARY KEY (`material`);

--
-- Indices de la tabla `perfil`
--
ALTER TABLE `perfil`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD PRIMARY KEY (`idPregunta`),
  ADD KEY `preguntas_ibfk_1` (`remitente`),
  ADD KEY `preguntas_ibfk_2` (`publicacion`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`idProducto`),
  ADD KEY `categoria` (`categoria`),
  ADD KEY `genero` (`genero`),
  ADD KEY `marca` (`marca`),
  ADD KEY `material` (`material`);

--
-- Indices de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  ADD PRIMARY KEY (`nroPublicacion`),
  ADD KEY `producto` (`producto`),
  ADD KEY `publicacion_ibfk_2` (`vendedor`);

--
-- Indices de la tabla `seguir`
--
ALTER TABLE `seguir`
  ADD PRIMARY KEY (`seguidor`,`seguido`),
  ADD KEY `seguir_ibfk_1` (`seguido`);

--
-- Indices de la tabla `talles`
--
ALTER TABLE `talles`
  ADD PRIMARY KEY (`talle`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  MODIFY `idPregunta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `idProducto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  MODIFY `nroPublicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cuenta_empresa`
--
ALTER TABLE `cuenta_empresa`
  ADD CONSTRAINT `cuenta_empresa_ibfk_1` FOREIGN KEY (`email`) REFERENCES `cuentas` (`email`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `cuenta_personal`
--
ALTER TABLE `cuenta_personal`
  ADD CONSTRAINT `cuenta_personal_ibfk_1` FOREIGN KEY (`email`) REFERENCES `cuentas` (`email`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `curvas`
--
ALTER TABLE `curvas`
  ADD CONSTRAINT `curvas_ibfk_1` FOREIGN KEY (`publicacion`) REFERENCES `publicacion` (`nroPublicacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `curvas_ibfk_2` FOREIGN KEY (`talle`) REFERENCES `talles` (`talle`);

--
-- Filtros para la tabla `enlaces`
--
ALTER TABLE `enlaces`
  ADD CONSTRAINT `enlaces_ibfk_2` FOREIGN KEY (`tipo`) REFERENCES `enlaces_tipos` (`plataforma`),
  ADD CONSTRAINT `enlaces_ibfk_3` FOREIGN KEY (`propietario`) REFERENCES `perfil` (`email`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `perfil`
--
ALTER TABLE `perfil`
  ADD CONSTRAINT `perfil_ibfk_1` FOREIGN KEY (`email`) REFERENCES `cuenta_empresa` (`email`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD CONSTRAINT `preguntas_ibfk_1` FOREIGN KEY (`remitente`) REFERENCES `cuenta_personal` (`email`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `preguntas_ibfk_2` FOREIGN KEY (`publicacion`) REFERENCES `publicacion` (`nroPublicacion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`categoria`) REFERENCES `categorias` (`categoria`),
  ADD CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`genero`) REFERENCES `generos` (`genero`),
  ADD CONSTRAINT `producto_ibfk_3` FOREIGN KEY (`marca`) REFERENCES `marcas` (`marca`),
  ADD CONSTRAINT `producto_ibfk_4` FOREIGN KEY (`material`) REFERENCES `materiales` (`material`);

--
-- Filtros para la tabla `publicacion`
--
ALTER TABLE `publicacion`
  ADD CONSTRAINT `publicacion_ibfk_1` FOREIGN KEY (`producto`) REFERENCES `producto` (`idProducto`),
  ADD CONSTRAINT `publicacion_ibfk_2` FOREIGN KEY (`vendedor`) REFERENCES `cuenta_empresa` (`email`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `seguir`
--
ALTER TABLE `seguir`
  ADD CONSTRAINT `seguir_ibfk_1` FOREIGN KEY (`seguido`) REFERENCES `cuenta_empresa` (`email`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `seguir_ibfk_2` FOREIGN KEY (`seguidor`) REFERENCES `cuenta_personal` (`email`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
