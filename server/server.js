const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", ".env")
});
const express = require("express");
const mongoose = require("mongoose");
const multer = require('multer');
const fs = require('fs');
const uploadFolder = path.join(__dirname, '..', 'public', 'images', 'products');
fs.mkdirSync(uploadFolder, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes.'));
    }
  }
});
const Product = require("./models/Product");
const Order = require("./models/Order");
const Donation = require("./models/Donation");
const Impact = require("./models/Impact");
const { randomUUID, timingSafeEqual } = require("crypto");

// Express crea el servidor HTTP que entrega la web y recibe las peticiones de la API.
const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "..");
// Permite leer cuerpos JSON y limita su tamaño para reducir solicitudes excesivas.
app.use(express.json({ limit: "20kb" }));
// Publica HTML, CSS, JavaScript e imágenes desde la carpeta principal del proyecto.
app.use(express.static(ROOT));

const PRODUCTS = [
  { _id: "1", name: "Ropa para perro", description: "Prendas cómodas para consentir a tu compañero.", price: 29900, category: "Ropa", image: "public/images/ropa.png" },
  { _id: "2", name: "Cama para perro", description: "Un lugar cómodo para descansar.", price: 19900, category: "Descanso", image: "public/images/cama.png" },
  { _id: "3", name: "Collar para perro", description: "Un accesorio para sus paseos.", price: 49900, category: "Accesorios", image: "public/images/collar.png" },
  { _id: "4", name: "Correa trenzada", description: "Para acompañar sus caminatas.", price: 34900, category: "Paseo", image: "public/images/correa.png" }
];
const databaseReady = () => mongoose.connection.readyState === 1;
// Aportes temporales para modo demostración (se reinician al apagar el servidor).
const demoDonations = [];
const adminSessions = new Set();
let demoImpact = { dogsHelped: 0, capsCollected: 0 };
const DONATION_TYPES = ["Tapitas plásticas", "Alimento para animales", "Voluntariado", "Aporte económico (intención)"];
function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token || !adminSessions.has(token)) return res.status(401).json({ error: "Inicia sesión como administradora." });
  next();
}

app.get("/api/health", (_req, res) => res.json({
  status: "ok",
  database: databaseReady() ? "connected" : "demo mode (MongoDB not connected)"
}));

app.get("/api/products", async (_req, res) => {
  try {
    const products = databaseReady() ? await Product.find({ active: true }).lean() : PRODUCTS;
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "No se pudieron consultar los productos." });
  }
});

// Consulta todos los productos para administrarlos.
app.get("/api/admin/products", requireAdmin, async (_req, res) => {
  try {
    const products = databaseReady()
      ? await Product.find().sort({ createdAt: -1 }).lean()
      : PRODUCTS;

    res.json({ products });
  } catch (error) {
    console.error("Error consultando productos:", error);
    res.status(500).json({
      error: "No se pudieron consultar los productos."
    });
  }
});

// Actualiza los datos de un producto.
app.put("/api/admin/products/:id", requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name?.trim() || !price || !category) {
      return res.status(400).json({
        error: "Completa los campos obligatorios."
      });
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({
        error: "El precio debe ser mayor que cero."
      });
    }

    const cambios = {
      name: name.trim(),
      description: description || '',
      price: Number(price),
      category
    };

    // Si seleccionas una imagen nueva, también la actualiza.
    if (req.file) {
      cambios.image = `public/images/products/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      cambios,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        error: "Producto no encontrado."
      });
    }

    res.json({
      message: "Producto actualizado correctamente.",
      product
    });

  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json({
      error: "No se pudo actualizar el producto."
    });
  }

  // Elimina un producto del inventario.
app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    if (databaseReady()) {
      const productoEliminado = await Product.findByIdAndDelete(req.params.id);

      if (!productoEliminado) {
        return res.status(404).json({
          error: "Producto no encontrado."
        });
      }
    } else {
      const indice = PRODUCTS.findIndex(
        producto => String(producto._id) === req.params.id
      );

      if (indice === -1) {
        return res.status(404).json({
          error: "Producto no encontrado."
        });
      }

      PRODUCTS.splice(indice, 1);
    }

    res.json({
      message: "Producto eliminado correctamente."
    });

  } catch (error) {
    console.error("Error eliminando producto:", error);

    res.status(500).json({
      error: "No se pudo eliminar el producto."
    });
  }
});
});

  app.post("/api/admin/products", requireAdmin, upload.single('image'), async (req, res) => { 
    const { name, description, price, category } = req.body;
    const image = req.file ? `public/images/products/${req.file.filename}` : '';
if (!name || !price || !category || !req.file) {  
    return res.status(400).json({
    error: "Completa los campos obligatorios y selecciona una imagen."
  });
}
if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
  return res.status(400).json({
    error: "El precio debe ser un número mayor que cero."
  });}
 try {
    const product = await Product.create({
    name,
    description,
    price: Number(price),
    category,
    image
});
return res.status(201).json({
  message: "Producto agregado correctamente.",
  product
});
} catch (error) {
  console.error("Error al guardar el producto:", error);

return res.status(500).json({
  error: "No se pudo guardar el producto."
});
}
});

app.post("/api/orders", async (req, res) => {
  const { customerName = "", phone = "", items } = req.body || {};
  if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
    return res.status(400).json({ error: "Incluye al menos un producto en el pedido." });
  }
  const safeItems = [];
  for (const item of items) {
    const product = PRODUCTS.find(p => p._id === String(item.productId)) ||
      (databaseReady() ? await Product.findById(item.productId).catch(() => null) : null);
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      return res.status(400).json({ error: "Hay un producto o cantidad inválida." });
    }
    safeItems.push({ productId: String(product._id), name: product.name, quantity, unitPrice: product.price });
  }
  const total = safeItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  if (!databaseReady()) {
    return res.status(201).json({ message: "Pedido validado en modo demostración. Conecta MongoDB para guardarlo de forma permanente.", order: { customerName, phone, items: safeItems, total, status: "nuevo" } });
  }
  try {
    const order = await Order.create({ customerName, phone, items: safeItems, total });
    res.status(201).json({ message: "Pedido guardado.", orderId: order._id, total });
  } catch (error) {
    res.status(500).json({ error: "No se pudo guardar el pedido." });
  }
});


// Registra un aporte. Con MongoDB conectado queda guardado permanentemente.
app.post("/api/donations", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const contact = typeof req.body?.contact === "string" ? req.body.contact.trim() : "";
  const type = typeof req.body?.type === "string" ? req.body.type : "";
  const detail = typeof req.body?.detail === "string" ? req.body.detail.trim() : "";
  if (name.length < 2 || name.length > 70 || contact.length > 100 || !DONATION_TYPES.includes(type) || !detail || detail.length > 140) {
    return res.status(400).json({ error: "Revisa el nombre, tipo de aporte y detalle. Hay datos inválidos." });
  }
  try {
    if (databaseReady()) {
      const donation = await Donation.create({ name, contact, type, detail });
      return res.status(201).json({ message: "Aporte registrado correctamente.", donation: { id: donation._id, name, type, detail, date: donation.createdAt, status: donation.status }, mode: "database" });
    }
    const donation = { id: String(Date.now()), name, type, detail, date: new Date().toISOString(), status: "pendiente" };
    demoDonations.unshift(donation);
    return res.status(201).json({ message: "Aporte registrado en modo demostración.", donation, mode: "demo" });
  } catch (error) {
    console.error("Error registrando aporte:", error.message);
    return res.status(500).json({ error: "No se pudo registrar el aporte." });
  }
});

// Devuelve los aportes más recientes para la ventana de seguimiento.
app.get("/api/donations", async (_req, res) => {
  try {
    const donations = databaseReady()
      ? await Donation.find().sort({ createdAt: -1 }).limit(100).lean()
      : demoDonations;
    const result = donations.map(item => ({
      id: String(item._id || item.id), name: item.name, type: item.type,
      detail: item.detail, date: item.createdAt || item.date, status: item.status || "pendiente"
    }));
    res.json({ donations: result, mode: databaseReady() ? "database" : "demo" });
  } catch (error) {
    console.error("Error consultando aportes:", error.message);
    res.status(500).json({ error: "No se pudo consultar el seguimiento." });
  }
});


// Cifras públicas: solo la administradora puede modificarlas después de verificar la ayuda.
app.get("/api/impact", async (_req, res) => {
  try {
    if (databaseReady()) {
      const impact = await Impact.findOne({ key: "public" }).lean();
      return res.json(impact || { dogsHelped: 0, capsCollected: 0 });
    }
    res.json(demoImpact);
  } catch (error) { res.status(500).json({ error: "No se pudo consultar el impacto." }); }
});

app.post("/api/admin/login", (req, res) => {
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return res.status(503).json({ error: "Configura ADMIN_PASSWORD en el archivo .env antes de usar el panel." });
  const supplied = Buffer.from(password);
  const actual = Buffer.from(expected);
  if (supplied.length !== actual.length || !timingSafeEqual(supplied, actual)) return res.status(401).json({ error: "Contraseña incorrecta." });
  const token = randomUUID(); adminSessions.add(token);
  res.json({ token, message: "Sesión de administración iniciada." });
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  adminSessions.delete(token); res.json({ message: "Sesión cerrada." });
});

app.get("/api/admin/overview", requireAdmin, async (_req, res) => {
  try {
    const donations = databaseReady() ? await Donation.find().sort({ createdAt: -1 }).limit(200).lean() : demoDonations;
    const impact = databaseReady() ? (await Impact.findOne({ key: "public" }).lean() || { dogsHelped: 0, capsCollected: 0 }) : demoImpact;
    res.json({ donations: donations.map(d => ({ id: String(d._id || d.id), name:d.name, contact:d.contact || "", type:d.type, detail:d.detail, date:d.createdAt || d.date, status:d.status || "pendiente" })), impact, mode: databaseReady() ? "database" : "demo" });
  } catch (error) { res.status(500).json({ error: "No se pudo cargar el panel." }); }
});

app.patch("/api/admin/donations/:id", requireAdmin, async (req, res) => {
  const status = req.body?.status;
  if (!["pendiente", "recibido", "verificado"].includes(status)) return res.status(400).json({ error: "Estado inválido." });
  try {
    if (databaseReady()) {
      const updated = await Donation.findByIdAndUpdate(req.params.id, { status }, { new:true });
      if (!updated) return res.status(404).json({ error: "Aporte no encontrado." });
    } else {
      const item = demoDonations.find(d => d.id === req.params.id);
      if (!item) return res.status(404).json({ error: "Aporte no encontrado en esta sesión." });
      item.status = status;
    }
    res.json({ message: "Estado actualizado." });
  } catch (error) { res.status(400).json({ error: "No se pudo actualizar el aporte." }); }
});

app.put("/api/admin/impact", requireAdmin, async (req, res) => {
  const dogsHelped = Number(req.body?.dogsHelped);
  const capsCollected = Number(req.body?.capsCollected);
  if (!Number.isSafeInteger(dogsHelped) || dogsHelped < 0 || dogsHelped > 1000000 || !Number.isSafeInteger(capsCollected) || capsCollected < 0 || capsCollected > 100000000) return res.status(400).json({ error: "Ingresa cantidades enteras válidas." });
  try {
    if (databaseReady()) await Impact.findOneAndUpdate({ key:"public" }, { dogsHelped, capsCollected, updatedAt:new Date() }, { upsert:true, new:true, setDefaultsOnInsert:true });
    else demoImpact = { dogsHelped, capsCollected };
    res.json({ message: "Impacto actualizado. Publica solo cifras que hayas verificado.", dogsHelped, capsCollected });
  } catch (error) { res.status(500).json({ error: "No se pudo actualizar el impacto." }); }
});

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim().slice(0, 500) : "";
  if (!message) return res.status(400).json({ error: "Escribe una pregunta." });
  const q = message.toLocaleLowerCase("es");
  let reply;
  if (/precio|cu[aá]nto|vale|costo/.test(q)) {
    reply = "Estos son los precios de referencia: ropa para perro $29.900, cama $19.900, collar $49.900 y correa trenzada $34.900 COP. Confirma disponibilidad antes de comprar.";
  } else if (/producto|collar|correa|ropa|cama|cat[aá]logo/.test(q)) {
    reply = "Tenemos ropa para perro ($29.900), cama ($19.900), collar ($49.900) y correa trenzada ($34.900). Puedes verlos en la sección Productos. Los precios son de referencia.";
  } else if (/tapita|tapa plastica|recolecci[oó]n|reciclaje|c[aá]ncer|niñ|fundaci[oó]n/.test(q)) {
    reply = "SaveBebi quiere impulsar una campaña de recolección de tapitas plásticas para apoyar iniciativas dirigidas a niños con cáncer. Lava y seca las tapitas y guárdalas limpias; antes de llevarlas, verifica el punto de recepción y la fundación responsable. Aún no anunciamos una alianza ni un punto de entrega confirmado.";
  } else if (/ayuda|calle|perrito|perro|misi[oó]n|donaci[oó]n|impacto/.test(q)) {
    reply = "SaveBebi busca unir las compras con el bienestar animal. La idea es destinar recursos para apoyar a perritos en situación de calle. Publicaremos los avances y las ayudas realizadas con transparencia.";
  } else if (/pedido|comprar|env[ií]o|entrega|pagar/.test(q)) {
    reply = "Añade los productos al carrito y usa el botón para preparar tu pedido por WhatsApp. El equipo debe confirmar disponibilidad, costo de envío y forma de pago.";
  } else if (/hola|buenas|buenos d[ií]as|buenas tardes|buenas noches/.test(q)) {
    reply = "¡Hola! 🐾 Bienvenida/o a SaveBebi. Puedo orientarte sobre productos, precios, pedidos y nuestra misión de bienestar animal.";
  } else {
    reply = "Puedo ayudarte con los productos, precios, pedidos o la misión de SaveBebi. ¿Qué te gustaría saber?";
  }
  res.json({ reply, mode: "faq" });
});

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB conectado.");
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        await Product.insertMany(PRODUCTS.map(({ _id, ...product }) => product));
        console.log("Productos de ejemplo agregados a MongoDB. Revisa nombres y precios antes de publicar.");
      }
    } catch (error) {
      console.error("No se pudo conectar a MongoDB. El servidor seguirá en modo demostración.", error.message);
    }
  } else {
    console.log("MONGODB_URI no configurada: iniciando en modo demostración.");
  }
  app.listen(PORT, () => console.log(`SaveBebi listo en http://localhost:${PORT}`));
}
start();
