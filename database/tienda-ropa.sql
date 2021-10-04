-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-10-2021 a las 22:05:45
-- Versión del servidor: 10.4.18-MariaDB
-- Versión de PHP: 8.0.3

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
('alan@gmail.com', '$2a$08$vrxtUI4SNLdrwh7YhYbGXeYsFN/aT/4pJ46OoE5qJ.YxUfc1iZJcG', 'usuario'),
('alma@gmail.com', '$2a$08$Y.xRVZSnbkuodm8GqWL8LuvLBghFoJqgtpL9CPz6ba4m6rRKkDlLS', 'empresa'),
('ema@gmail.com', '$2a$08$15krDl7X0yNKv5gfEDo2v.YInduPFfBy.02urBGX0NywyaZVHCo3u', 'usuario'),
('macri@gmail.com', '$2a$08$WItZSXoV8mSY49DLyjmH4elaFVT5rm/1faJ4cJdqX8l7xjLdnnvba', 'empresa'),
('penelope@gmail.com', '$2a$08$6Gl95UT9lWJjC0xfwsiite7zvxHHU0vPReieRsSXve8dBo1C8Nuj2', 'empresa'),
('santiago@gmail.com', '$2a$08$XCdbNkoweA.T0htRhMFGHOViaxdwTKghudzthNtZOGLFFB8J8EYme', 'empresa'),
('tienda@gmail.com', '$2a$08$H.a4hPGqN3j8hJxNybntC.gp34UC6DucdfjS8gHeJ0XRP7SXL63pa', 'empresa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuenta_empresa`
--

CREATE TABLE `cuenta_empresa` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `RUT` int(12) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `razonSocial` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `cuenta_empresa`
--

INSERT INTO `cuenta_empresa` (`id`, `email`, `RUT`, `nombre`, `razonSocial`) VALUES
(1, 'penelope@gmail.com', 999, 'Penelope', 'SL'),
(2, 'alma@gmail.com', 2002, 'Alma', 'SLNE'),
(3, 'tienda@gmail.com', 8888, 'Tienda', 'SA'),
(4, 'macri@gmail.com', 54654, 'Macri', 'SA'),
(5, 'santiago@gmail.com', 2007, 'Santiago', 'SLNE');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuenta_personal`
--

CREATE TABLE `cuenta_personal` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `cuenta_personal`
--

INSERT INTO `cuenta_personal` (`id`, `email`, `nombre`) VALUES
(4, 'alan@gmail.com', 'Alan Texeira'),
(5, 'ema@gmail.com', 'Emanuel Maquieira');

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
('35', 3),
('36', 1),
('37', 1),
('38', 2),
('39', 2),
('40', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `descuento`
--

CREATE TABLE `descuento` (
  `publication` int(11) NOT NULL,
  `porcentaje` int(2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `descuento`
--

INSERT INTO `descuento` (`publication`, `porcentaje`) VALUES
(1, 40),
(2, 80),
(4, 50);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `enlaces`
--

CREATE TABLE `enlaces` (
  `tipo` varchar(255) NOT NULL,
  `URL` varchar(255) NOT NULL,
  `propietario` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `enlaces`
--

INSERT INTO `enlaces` (`tipo`, `URL`, `propietario`) VALUES
('Facebook', 'facebook.com/user/penelope', 'penelope@gmail.com'),
('Instagram', 'instagram.com/penelope', 'penelope@gmail.com');

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
('Obsidiana'),
('Pieles'),
('Poliéster'),
('Seda');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfil`
--

CREATE TABLE `perfil` (
  `email` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `perfil`
--

INSERT INTO `perfil` (`email`, `nombre`, `descripcion`, `direccion`, `telefono`) VALUES
('alma@gmail.com', 'Alma', '', '', ''),
('macri@gmail.com', 'Macri', '', '', ''),
('penelope@gmail.com', 'Penelope', '', '', ''),
('santiago@gmail.com', 'Santiago', '', '', ''),
('tienda@gmail.com', 'Tienda', '', '', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preguntas`
--

CREATE TABLE `preguntas` (
  `idPregunta` int(11) NOT NULL,
  `mensaje` varchar(255) NOT NULL,
  `fechaPregunta` datetime NOT NULL,
  `remitente` varchar(255) NOT NULL,
  `publicacion` int(11) NOT NULL,
  `respuesta` varchar(255) NOT NULL,
  `fechaRespuesta` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `preguntas`
--

INSERT INTO `preguntas` (`idPregunta`, `mensaje`, `fechaPregunta`, `remitente`, `publicacion`, `respuesta`, `fechaRespuesta`) VALUES
(40, 'Está muy caro este producto, si no le bajan el precio no se los compra nadie, máximo 200 pesos', '2021-10-01 20:32:09', 'ema@gmail.com', 4, '', '0000-00-00 00:00:00'),
(42, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut, quam possimus distinctio repellendus molestias perspiciatis. Modi, asperiores.', '2021-10-04 15:53:05', 'alan@gmail.com', 1, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '0000-00-00 00:00:00'),
(43, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut, quam possimus distinctio repellendus molestias perspiciatis. Modi, asperiores.', '2021-10-04 15:53:07', 'alan@gmail.com', 1, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '0000-00-00 00:00:00'),
(44, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut, quam possimus distinctio repellendus molestias perspiciatis. Modi, asperiores.', '2021-10-04 15:53:10', 'alan@gmail.com', 1, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '0000-00-00 00:00:00'),
(45, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut, quam possimus distinctio repellendus molestias perspiciatis. Modi, asperiores.', '2021-10-04 15:53:12', 'alan@gmail.com', 1, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '0000-00-00 00:00:00'),
(46, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '2021-10-04 15:53:19', 'alan@gmail.com', 1, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '0000-00-00 00:00:00'),
(47, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '2021-10-04 15:53:21', 'alan@gmail.com', 1, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '0000-00-00 00:00:00'),
(48, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '2021-10-04 15:53:23', 'alan@gmail.com', 1, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '0000-00-00 00:00:00'),
(50, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut, quam possimus distinctio repellendus molestias perspiciatis. Modi, asperiores.', '2021-10-04 15:58:35', 'alan@gmail.com', 2, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '0000-00-00 00:00:00'),
(51, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut, quam possimus distinctio repellendus molestias perspiciatis. Modi, asperiores.', '2021-10-04 15:58:37', 'alan@gmail.com', 2, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '0000-00-00 00:00:00'),
(52, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut, quam possimus distinctio repellendus molestias perspiciatis. Modi, asperiores.', '2021-10-04 15:58:39', 'alan@gmail.com', 2, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '0000-00-00 00:00:00'),
(53, 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt harum minus maiores molestiae, aperiam hic tempora impedit mollitia debitis explicabo minima ut', '2021-10-04 15:58:45', 'alan@gmail.com', 2, '', '0000-00-00 00:00:00');

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
(5, 'accesorio', 'Masculino', 'Poliéster', 'Chanel'),
(6, 'accesorio', 'Femenino', 'Algodón', 'Adidas'),
(7, 'accesorio', 'Femenino', 'Seda', 'Chanel'),
(8, 'accesorio', 'Femenino', 'Seda', 'Chanel'),
(9, 'jeans', 'Unisex', 'Cuero', 'Adidas'),
(10, 'calzado', 'Hombre', 'Algodón', 'Chanel'),
(11, 'accesorio', 'Hombre', 'Cuero', 'Nike'),
(12, 'accesorio', 'Hombre', 'Pieles', 'Genérica'),
(14, 'accesorio', 'Mujer', 'Poliéster', 'Gucci');

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
(1, 1000, 'Zapatillos', 'Buenos zapatos para empezar a caminar', 2, 'macri@gmail.com'),
(2, 400, 'Remera azul', 'Una remera simple de color azul', 3, 'alma@gmail.com'),
(3, 800, 'Remera roja', 'Una sencilla remera de color roja pero elegante ke lo ke', 4, 'alma@gmail.com'),
(4, 5000, 'Collar de diamantes', 'Sale un huevo y medio, pero están chetas', 5, 'penelope@gmail.com'),
(5, 333, 'Buena remera', 'Remera facherita', 9, 'alma@gmail.com'),
(6, 4444, 'fasafsafsafs', 'djdfdfjdfj', 10, 'alma@gmail.com'),
(7, 2147483647, 'gei', 'gei', 11, 'santiago@gmail.com'),
(8, 850, 'Sombrero de guerra', 'Un sombrero es una prenda de vestir que se utiliza específicamente para cubrir la cabeza, ya sea del sol, el frío o incluso marcar el estatus social del portador. El término sombrero se ha modificado, convirtiéndolo en un término específico para designar ', 12, 'penelope@gmail.com'),
(9, 2147483647, 'asfasfasffas', 'asfasfsfafas', 14, 'penelope@gmail.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguir`
--

CREATE TABLE `seguir` (
  `seguidor` varchar(255) NOT NULL,
  `seguido` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `cuenta_empresa_ibfk_1` (`email`);

--
-- Indices de la tabla `cuenta_personal`
--
ALTER TABLE `cuenta_personal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cuenta_personal_ibfk_1` (`email`);

--
-- Indices de la tabla `curvas`
--
ALTER TABLE `curvas`
  ADD PRIMARY KEY (`talle`,`publicacion`),
  ADD KEY `curvas_ibfk_1` (`publicacion`);

--
-- Indices de la tabla `descuento`
--
ALTER TABLE `descuento`
  ADD PRIMARY KEY (`publication`);

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
-- AUTO_INCREMENT de la tabla `cuenta_empresa`
--
ALTER TABLE `cuenta_empresa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `cuenta_personal`
--
ALTER TABLE `cuenta_personal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  MODIFY `idPregunta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `idProducto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  MODIFY `nroPublicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
-- Filtros para la tabla `descuento`
--
ALTER TABLE `descuento`
  ADD CONSTRAINT `descuento_ibfk_1` FOREIGN KEY (`publication`) REFERENCES `publicacion` (`nroPublicacion`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `perfil_ibfk_1` FOREIGN KEY (`email`) REFERENCES `cuentas` (`email`) ON DELETE CASCADE ON UPDATE CASCADE;

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
