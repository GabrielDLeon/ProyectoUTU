-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-09-2021 a las 02:34:55
-- Versión del servidor: 10.4.20-MariaDB
-- Versión de PHP: 7.3.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `proyectoutu`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuenta`
--

CREATE TABLE `cuenta` (
  `mail` varchar(255) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `tipo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `cuenta`
--

INSERT INTO `cuenta` (`mail`, `pass`, `tipo`) VALUES
('emaquieira29@gmail.com', '$2a$08$rSxm9cS/6KTO.AU.V8D68ensPpW8Se0CdL4NKG0uSsbRuCEvP20AK', 'usuario'),
('emqidiota@gmail.com', '$2a$08$R57RLMp6hjfrpLnXfxW0e.6fp6c.naI3a.Jn3C19YcO6v1hAEf/0K', 'usuario'),
('jpoggio@gmail.com', '$2a$08$tKXrTVEoQK5YTYzInVtL0OJuzsmWM05lGINZMmMeZCqufLb.2xNXy', 'usuario'),
('juianemaneul@gmail.com', '$2a$08$loASmdUPuFAku41M/0PWoeQVihMyv/MzD78nj8F610Mc1r7lRugAm', 'usuario'),
('mariodeleon@gmail.com', '$2a$08$asgy6RVQ1uUF.ey2s2oFfuSWr91EhjnNuDwwMV1wr00uRv/gnUGuK', 'usuario'),
('tiendaderopa@gmail.com', '$2a$08$hpDGra7rHjbmUENJRC41iuu9FvDYvcvPuBw5fH1gsr0A3umauGzLW', 'empresa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `name` varchar(255) NOT NULL,
  `rut` int(255) NOT NULL,
  `mailEmpresa` varchar(250) NOT NULL,
  `razon` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`name`, `rut`, `mailEmpresa`, `razon`) VALUES
('Tienda de ropa', 2147483647, 'tiendaderopa@gmail.com', 'SRL');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `mailUsuario` varchar(250) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`mailUsuario`, `name`) VALUES
('emaquieira29@gmail.com', 'Emanuel Maquieira'),
('emqidiota@gmail.com', 'emanuel idiota'),
('jpoggio@gmail.com', 'juan poggio'),
('mariodeleon@gmail.com', '');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cuenta`
--
ALTER TABLE `cuenta`
  ADD PRIMARY KEY (`mail`);

--
-- Indices de la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`rut`),
  ADD UNIQUE KEY `mailEmpresa` (`mailEmpresa`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`mailUsuario`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD CONSTRAINT `email` FOREIGN KEY (`mailEmpresa`) REFERENCES `cuenta` (`mail`);

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `mail` FOREIGN KEY (`mailUsuario`) REFERENCES `cuenta` (`mail`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
