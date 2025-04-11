import axios from 'axios';
import fs from 'fs';
import path from 'path';
import https from 'https';

export default async function handler(req, res) {
  const { SHOPIFY_STORE, SHOPIFY_API_TOKEN } = process.env;

  const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filepath);
      https.get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      }).on("error", (err) => {
        fs.unlink(filepath, () => reject(err.message));
      });
    });
  };

  const folderPath = path.join(process.cwd(), "public/images");
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  try {
    let allProducts = [];
    let sinceId = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `https://${SHOPIFY_STORE}/admin/api/2023-10/products.json?limit=250&since_id=${sinceId}`;

      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_API_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      const products = response.data.products;
      if (products.length === 0) {
        hasMore = false;
        break;
      }

      allProducts = [...allProducts, ...products];
      sinceId = products[products.length - 1].id;
    }

    for (const product of allProducts) {
      const sku = product.variants[0]?.sku || "no-sku";
      const images = product.images;

      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i].src;
        const ext = path.extname(imageUrl).split("?")[0] || ".jpg";
        const imageName = images.length === 1 ? sku : `${sku}-${i + 1}`;
        const filePath = path.join(folderPath, `${imageName}${ext}`);
        await downloadImage(imageUrl, filePath);
      }
    }

    res.status(200).json({ message: `✅ Downloaded ${allProducts.length} products' images successfully!` });
  } catch (err) {
    console.error("❌ Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Something went wrong!" });
  }
}
