-- Run this in gstdb (SQL Server)
-- Creates all tables needed for the Asignaciones app

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='asig_zonas' AND xtype='U')
CREATE TABLE asig_zonas (
  id    INT PRIMARY KEY IDENTITY,
  nombre NVARCHAR(100) NOT NULL,
  activo BIT DEFAULT 1
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='asig_viajes' AND xtype='U')
CREATE TABLE asig_viajes (
  id                  INT PRIMARY KEY IDENTITY,
  no_solicitud        NVARCHAR(50),
  cliente_paga        NVARCHAR(200),

  zona_origen         NVARCHAR(100),
  ciudad_origen       NVARCHAR(100),
  cliente_carga       NVARCHAR(200),
  ubicacion_carga     NVARCHAR(500),
  cita_carga          DATETIME2,

  zona_destino        NVARCHAR(100),
  ciudad_destino      NVARCHAR(100),
  cliente_descarga    NVARCHAR(200),
  ubicacion_descarga  NVARCHAR(500),
  cita_descarga       DATETIME2,

  operador            NVARCHAR(200),
  tracto              NVARCHAR(20),
  remolque            NVARCHAR(20),
  folio_remision      NVARCHAR(100),
  carta_porte         NVARCHAR(100),

  estatus             NVARCHAR(50) DEFAULT 'PENDIENTE',
  coordinador         NVARCHAR(200),
  notas               NVARCHAR(1000),

  fecha_creacion      DATETIME2 DEFAULT GETDATE(),
  fecha_modificacion  DATETIME2 DEFAULT GETDATE()
);

-- Seed zones (skip if already exist)
IF NOT EXISTS (SELECT 1 FROM asig_zonas)
BEGIN
  INSERT INTO asig_zonas (nombre) VALUES
    ('MONTERREY'),
    ('MEXICALI'),
    ('ORIZABA'),
    ('GUADALAJARA'),
    ('MEXICO'),
    ('TIJUANA'),
    ('OTRAS LOCALIDADES'),
    ('BRASKEM');
END
