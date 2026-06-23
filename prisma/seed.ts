import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

const GEO_DATA = [
  {
    nombre: 'Distrito Capital',
    municipios: [
      {
        nombre: 'Libertador',
        parroquias: [
          'Altagracia', 'Antímano', 'Caricuao', 'Catedral', 'Coche',
          'El Junquito', 'El Paraíso', 'El Recreo', 'El Valle',
          'La Candelaria', 'La Pastora', 'La Vega', 'Macarao',
          'San Agustín', 'San Bernardino', 'San José', 'San Juan',
          'Santa Rosalía', 'Santa Teresa', 'Sucre', '23 de Enero',
        ],
      },
    ],
  },
  {
    nombre: 'Miranda',
    municipios: [
      {
        nombre: 'Baruta',
        parroquias: [
          'El Cafetal', 'Las Minas de Baruta',
          'Nuestra Señora del Rosario', 'Santa Cruz del Este',
        ],
      },
      {
        nombre: 'Chacao',
        parroquias: ['Chacao'],
      },
      {
        nombre: 'El Hatillo',
        parroquias: ['El Hatillo', 'La Lagunita', 'Las Mayas', 'Turumo'],
      },
      {
        nombre: 'Sucre',
        parroquias: [
          'Caucagüita', 'Fila de Mariches', 'La Dolorita',
          'Leoncio Martínez', 'Petare', 'Santa Lucía',
        ],
      },
    ],
  },
  {
    nombre: 'Zulia',
    municipios: [
      {
        nombre: 'Maracaibo',
        parroquias: [
          'Antonio Borjas Romero', 'Bolívar', 'Cacique Mara',
          'Caracciolo Parra Pérez', 'Cecilio Acosta', 'Chiquinquirá',
          'Coquivacoa', 'Cristo de Aranza', 'Idelfonso Vásquez',
          'Juana de Ávila', 'Luis Hurtado Higuera', 'Manuel Dagnino',
          'Olegario Villalobos', 'Raúl Leoni', 'San Isidro',
          'Santa Lucía', 'Venancio Pulgar',
        ],
      },
      {
        nombre: 'San Francisco',
        parroquias: [
          'Domitila Flores', 'Francisco Ochoa', 'Los Cortijos',
          'Marcial Hernández', 'José Domingo Rus',
        ],
      },
    ],
  },
  {
    nombre: 'Portuguesa',
    municipios: [
      {
        nombre: 'Guanare',
        parroquias: [
          'Biscucuy', 'Campo Elías', 'Guanare', 'San Francisco de Asís',
        ],
      },
      {
        nombre: 'Turén',
        parroquias: [
          'Turén', 'San Rafael de Onoto', 'Santo Cristo',
          'San José de la Montaña',
        ],
      },
    ],
  },
];

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed...');

  // Sembrar estructura geopolítica (idempotente con upsert)
  for (const estadoData of GEO_DATA) {
    const estado = await prisma.estado.upsert({
      where: { nombre: estadoData.nombre },
      update: {},
      create: { nombre: estadoData.nombre },
    });

    console.log(`  📍 Estado: ${estado.nombre}`);

    for (const municipioData of estadoData.municipios) {
      const municipio = await prisma.municipio.upsert({
        where: {
          nombre_estadoId: {
            nombre: municipioData.nombre,
            estadoId: estado.id,
          },
        },
        update: {},
        create: {
          nombre: municipioData.nombre,
          estadoId: estado.id,
        },
      });

      console.log(`    🏘️  Municipio: ${municipio.nombre}`);

      for (const parroquiaNombre of municipioData.parroquias) {
        await prisma.parroquia.upsert({
          where: {
            nombre_municipioId: {
              nombre: parroquiaNombre,
              municipioId: municipio.id,
            },
          },
          update: {},
          create: {
            nombre: parroquiaNombre,
            municipioId: municipio.id,
          },
        });
      }

      console.log(`      ✅ ${municipioData.parroquias.length} parroquias insertadas`);
    }
  }

  // Crear usuario admin (elimina previo para garantizar estado limpio)
  await prisma.usuario.deleteMany({ where: { username: 'admin' } });

  await prisma.usuario.create({
    data: {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      nombre: 'Administrador Principal',
      rol: 'ADMIN',
    },
  });

  console.log('\n👤 Usuario admin creado correctamente.');
  console.log('✅ Seed completado exitosamente.');
}

main()
  .catch((err: unknown) => {
    console.error('❌ Error durante el seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
