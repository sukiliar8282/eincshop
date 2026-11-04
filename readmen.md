cek error:npx tsc --noEmit
masuk developer: http://localhost:51212

## Local Development URLs

### Public Catalog

- Product catalog: http://localhost:3000/products
- Product detail: http://localhost:3000/products/[slug]
- http://localhost:3000/account/orders
Contoh:

http://localhost:3000/products/ebook-trading

### Admin

- Admin dashboard: http://localhost:3000/admin
- Manage categories: http://localhost:3000/admin/categories
- Create product: http://localhost:3000/admin/products/new
- http://localhost:3000/admin/products/new
- http://localhost:3000/admin/products
- http://localhost:3000/cart
- http://localhost:3000/admin/orders
- http://localhost:3000/admin/audit-logs
## Run Project

```bash
npm run dev
npx prisma studio

update web
git add .
git commit -m "catatan perubahan Anda"
git push origin main