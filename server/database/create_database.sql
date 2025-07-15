-- Script para criar o banco de dados
-- Execute este script primeiro no seu servidor MariaDB/MySQL

CREATE DATABASE IF NOT EXISTS contacts
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Verificar se o banco foi criado
SHOW DATABASES LIKE 'contacts';

-- Usar o banco
USE contacts;

-- Verificar se estamos no banco correto
SELECT DATABASE();
