# Sistema de Votación Anónima (Tier List)

Este es un sistema diseñado para realizar votaciones de tipo "Tier List" (S, A, B, C, D) de forma totalmente anónima, preveniendo que un mismo usuario vote más de una vez (Sybil Resistance), y asegurando que los votos no estén vinculados a la identidad del votante en la base de datos.

## Arquitectura

- **Framework:** Next.js (App Router)
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Anonimato:** Basado en Tokens de un solo uso.
- **Cálculo de Ganador:** Borda Count (S=5pts, A=4pts, B=3pts, C=2pts, D=1pt).

## Desarrollo Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura tu Base de Datos:
   - Necesitas una base de datos PostgreSQL en ejecución.
   - Crea un archivo `.env` en la raíz del proyecto.
   - Añade tu URL de conexión:
     ```env
     DATABASE_URL="postgresql://usuario:password@localhost:5432/votaciones"
     DIRECT_URL="postgresql://usuario:password@localhost:5432/votaciones"
     ```

3. Inicializa la base de datos:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Genera tokens de prueba:
   ```bash
   npx tsx scripts/seed.ts
   ```

5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

6. Entra a `http://localhost:3000` e ingresa uno de los tokens generados por el script.

## Despliegue en Vercel

Este proyecto está listo para ser desplegado en Vercel.

1. Haz push de este repositorio a GitHub.
2. En el panel de Vercel, crea un nuevo proyecto e importa tu repositorio.
3. En la pestaña de "Storage" de Vercel, crea una nueva base de datos **Vercel Postgres**.
4. Conecta la base de datos a tu proyecto (Vercel configurará automáticamente las variables `DATABASE_URL` y otras necesarias).
5. En los Settings de Vercel, asegúrate de que el "Build Command" sea `npx prisma generate && npx prisma db push && next build` (o configura un script de `postinstall` en tu `package.json` para ejecutar `prisma generate`).
6. ¡Haz Deploy!
