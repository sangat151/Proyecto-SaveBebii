
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env")
});

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomUUID, timingSafeEqual } = require("crypto");

const Product = require("./models/Product");
const Order = require("./models/Order");
const Donation = require("./models/Donation");
const Impact = require("./models/Impact");
const User = require("./models/User");

// Configuración principal del servidor.
const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "..");

// Configuración de imágenes de productos.
const uploadFolder = path.join(
  ROOT,
  "public",
  "images",
  "products"
);

fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1E9
    )}${extension}`;

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes."));
    }
  }
});

// Permite leer solicitudes JSON.
app.use(express.json({ limit: "20kb" }));
// Permite que GitHub Pages se comunique con el backend.
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://sangat151.github.io"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Publica las imágenes y archivos públicos de SaveBebi.
app.use("/public", express.static(path.join(ROOT, "public")));

// Comprueba si MongoDB está conectado.
const databaseReady = () => mongoose.connection.readyState === 1;

// Datos temporales para donaciones e impacto.
// Estos datos no corresponden al inventario de productos.
const demoDonations = [];
const adminSessions = new Set();

let demoImpact = {
  dogsHelped: 0,
  capsCollected: 0
};

const DONATION_TYPES = [
  "Tapitas plásticas",
  "Alimento para animales",
  "Voluntariado",
  "Aporte económico (intención)"
];

// Comprueba que la persona haya iniciado sesión como administradora.
function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace(
    /^Bearer\s+/i,
    ""
  );

  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({
      error: "Inicia sesión como administradora."
    });
  }

  next();
}

// Estado del servidor y de MongoDB.
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: databaseReady() ? "connected" : "disconnected"
  });
});


// ==========================================
// REGISTRO DE USUARIOS
// ==========================================

app.post("/api/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        mensaje: "Completa todos los campos."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres."
      });
    }

    if (!databaseReady()) {
      return res.status(503).json({
        mensaje: "La base de datos no está disponible."
      });
    }

    const correo = email.trim().toLowerCase();

    const usuarioExistente = await User.findOne({
      email: correo
    });

    if (usuarioExistente) {
      return res.status(409).json({
        mensaje: "Este correo ya está registrado."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const nuevoUsuario = await User.create({
      nombre: nombre.trim(),
      email: correo,
      password: passwordHash
    });

    return res.status(201).json({
      mensaje: "Cuenta creada correctamente.",
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email
      }
    });

  } catch (error) {
    console.error("Error al registrar usuario:", error);

    return res.status(500).json({
      mensaje: "Ocurrió un error al crear la cuenta."
    });
  }
});


// ==========================================
// INICIO DE SESIÓN DE USUARIOS
// ==========================================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        mensaje: "Ingresa tu correo y contraseña."
      });
    }

    if (!databaseReady()) {
      return res.status(503).json({
        mensaje: "La base de datos no está disponible."
      });
    }

    const usuario = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos."
      });
    }

    const contrasenaCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!contrasenaCorrecta) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos."
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("Falta configurar JWT_SECRET en el archivo .env");

      return res.status(503).json({
        mensaje: "El inicio de sesión no está configurado correctamente."
      });
    }

    const token = jwt.sign(
      { id: usuario._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      mensaje: "¡Bienvenido a SaveBebi!",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    return res.status(500).json({
      mensaje: "Ocurrió un error al iniciar sesión."
    });
  }
});


// ==========================================
// PRODUCTOS DE LA TIENDA
// ==========================================

// Consulta únicamente productos activos guardados en MongoDB.
app.get("/api/products", async (_req, res) => {
  try {
    if (!databaseReady()) {
      return res.status(503).json({
        error: "La base de datos no está disponible."
      });
    }

    const products = await Product.find({
      active: true
    }).lean();

    return res.json(products);

  } catch (error) {
    console.error("Error consultando productos:", error);

    return res.status(500).json({
      error: "No se pudieron consultar los productos."
    });
  }
});


// ==========================================
// ADMINISTRACIÓN DE PRODUCTOS
// ==========================================

// Consulta todos los productos del inventario.
app.get("/api/admin/products", requireAdmin, async (_req, res) => {
  try {
    if (!databaseReady()) {
      return res.status(503).json({
        error: "La base de datos no está disponible."
      });
    }

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ products });

  } catch (error) {
    console.error("Error consultando productos:", error);

    return res.status(500).json({
      error: "No se pudieron consultar los productos."
    });
  }
});


// Agrega un producto nuevo a MongoDB.
app.post(
  "/api/admin/products",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!databaseReady()) {
        return res.status(503).json({
          error: "La base de datos no está disponible."
        });
      }

      const { name, description, price, category } = req.body;

      if (
        !name?.trim() ||
        !price ||
        !category?.trim() ||
        !req.file
      ) {
        return res.status(400).json({
          error: "Completa los campos obligatorios y selecciona una imagen."
        });
      }

      if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
        return res.status(400).json({
          error: "El precio debe ser mayor que cero."
        });
      }

      const product = await Product.create({
        name: name.trim(),
        description: description?.trim() || "",
        price: Number(price),
        category: category.trim(),
        image: `public/images/products/${req.file.filename}`
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
  }
);


// Actualiza los datos de un producto.
app.put(
  "/api/admin/products/:id",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!databaseReady()) {
        return res.status(503).json({
          error: "La base de datos no está disponible."
        });
      }

      const { name, description, price, category } = req.body;

      if (
        !name?.trim() ||
        !price ||
        !category?.trim()
      ) {
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
        description: description?.trim() || "",
        price: Number(price),
        category: category.trim()
      };

      if (req.file) {
        cambios.image = `public/images/products/${req.file.filename}`;
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        cambios,
        {
          new: true,
          runValidators: true
        }
      );

      if (!product) {
        return res.status(404).json({
          error: "Producto no encontrado."
        });
      }

      return res.json({
        message: "Producto actualizado correctamente.",
        product
      });

    } catch (error) {
      console.error("Error actualizando producto:", error);

      return res.status(500).json({
        error: "No se pudo actualizar el producto."
      });
    }
  }
);


// Elimina un producto de MongoDB.
app.delete(
  "/api/admin/products/:id",
  requireAdmin,
  async (req, res) => {
    try {
      if (!databaseReady()) {
        return res.status(503).json({
          error: "La base de datos no está disponible."
        });
      }

      const productoEliminado = await Product.findByIdAndDelete(
        req.params.id
      );

      if (!productoEliminado) {
        return res.status(404).json({
          error: "Producto no encontrado."
        });
      }

      return res.json({
        message: "Producto eliminado correctamente."
      });

    } catch (error) {
      console.error("Error eliminando producto:", error);

      return res.status(500).json({
        error: "No se pudo eliminar el producto."
      });
    }
  }
);


// ==========================================
// PEDIDOS
// ==========================================

// Valida los productos y guarda el pedido en MongoDB.
app.post("/api/orders", async (req, res) => {
  try {
    if (!databaseReady()) {
      return res.status(503).json({
        error: "La base de datos no está disponible. No se puede guardar el pedido."
      });
    }

    const {
      customerName = "",
      phone = "",
      items
    } = req.body || {};

    if (
      !Array.isArray(items) ||
      items.length < 1 ||
      items.length > 30
    ) {
      return res.status(400).json({
        error: "Incluye al menos un producto en el pedido."
      });
    }

    const safeItems = [];

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({
          error: "Hay un producto inválido en el pedido."
        });
      }

      const product = await Product.findOne({
        _id: item.productId,
        active: true
      });

      const quantity = Number(item.quantity);

      if (
        !product ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 50
      ) {
        return res.status(400).json({
          error: "Hay un producto o cantidad inválida."
        });
      }

      safeItems.push({
        productId: String(product._id),
        name: product.name,
        quantity,
        unitPrice: product.price
      });
    }

    const total = safeItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const order = await Order.create({
      customerName,
      phone,
      items: safeItems,
      total
    });

    return res.status(201).json({
      message: "Pedido guardado correctamente.",
      orderId: order._id,
      total
    });

  } catch (error) {
    console.error("Error guardando pedido:", error);

    return res.status(500).json({
      error: "No se pudo guardar el pedido."
    });
  }
});


// ==========================================
// DONACIONES Y APORTES
// ==========================================

// Registra un aporte.
app.post("/api/donations", async (req, res) => {
  const name = typeof req.body?.name === "string"
    ? req.body.name.trim()
    : "";

  const contact = typeof req.body?.contact === "string"
    ? req.body.contact.trim()
    : "";

  const type = typeof req.body?.type === "string"
    ? req.body.type
    : "";

  const detail = typeof req.body?.detail === "string"
    ? req.body.detail.trim()
    : "";

  if (
    name.length < 2 ||
    name.length > 70 ||
    contact.length > 100 ||
    !DONATION_TYPES.includes(type) ||
    !detail ||
    detail.length > 140
  ) {
    return res.status(400).json({
      error: "Revisa el nombre, tipo de aporte y detalle. Hay datos inválidos."
    });
  }

  try {
    if (databaseReady()) {
      const donation = await Donation.create({
        name,
        contact,
        type,
        detail
      });

      return res.status(201).json({
        message: "Aporte registrado correctamente.",
        donation: {
          id: donation._id,
          name,
          type,
          detail,
          date: donation.createdAt,
          status: donation.status
        },
        mode: "database"
      });
    }

    const donation = {
      id: String(Date.now()),
      name,
      type,
      detail,
      date: new Date().toISOString(),
      status: "pendiente"
    };

    demoDonations.unshift(donation);

    return res.status(201).json({
      message: "Aporte registrado en modo demostración.",
      donation,
      mode: "demo"
    });

  } catch (error) {
    console.error("Error registrando aporte:", error.message);

    return res.status(500).json({
      error: "No se pudo registrar el aporte."
    });
  }
});


// Consulta los aportes registrados.
app.get("/api/donations", async (_req, res) => {
  try {
    const donations = databaseReady()
      ? await Donation.find()
          .sort({ createdAt: -1 })
          .limit(100)
          .lean()
      : demoDonations;

    const result = donations.map(item => ({
      id: String(item._id || item.id),
      name: item.name,
      type: item.type,
      detail: item.detail,
      date: item.createdAt || item.date,
      status: item.status || "pendiente"
    }));

    return res.json({
      donations: result,
      mode: databaseReady() ? "database" : "demo"
    });

  } catch (error) {
    console.error("Error consultando aportes:", error.message);

    return res.status(500).json({
      error: "No se pudo consultar el seguimiento."
    });
  }
});


// ==========================================
// IMPACTO SOCIAL
// ==========================================

// Consulta las cifras públicas de impacto.
app.get("/api/impact", async (_req, res) => {
  try {
    if (databaseReady()) {
      const impact = await Impact.findOne({
        key: "public"
      }).lean();

      return res.json(
        impact || {
          dogsHelped: 0,
          capsCollected: 0
        }
      );
    }

    return res.json(demoImpact);

  } catch (error) {
    console.error("Error consultando impacto:", error);

    return res.status(500).json({
      error: "No se pudo consultar el impacto."
    });
  }
});


// ==========================================
// ADMINISTRACIÓN
// ==========================================

// Inicio de sesión de administradora.
app.post("/api/admin/login", (req, res) => {
  const password = typeof req.body?.password === "string"
    ? req.body.password
    : "";

  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected) {
    return res.status(503).json({
      error: "Configura ADMIN_PASSWORD en el archivo .env antes de usar el panel."
    });
  }

  const supplied = Buffer.from(password);
  const actual = Buffer.from(expected);

  if (
    supplied.length !== actual.length ||
    !timingSafeEqual(supplied, actual)
  ) {
    return res.status(401).json({
      error: "Contraseña incorrecta."
    });
  }

  const token = randomUUID();

  adminSessions.add(token);

  return res.json({
    token,
    message: "Sesión de administración iniciada."
  });
});


// Cierra la sesión de administradora.
app.post("/api/admin/logout", requireAdmin, (req, res) => {
  const token = (req.headers.authorization || "").replace(
    /^Bearer\s+/i,
    ""
  );

  adminSessions.delete(token);

  return res.json({
    message: "Sesión cerrada."
  });
});


// Información general del panel de administración.
app.get("/api/admin/overview", requireAdmin, async (_req, res) => {
  try {
    const donations = databaseReady()
      ? await Donation.find()
          .sort({ createdAt: -1 })
          .limit(200)
          .lean()
      : demoDonations;

    const impact = databaseReady()
      ? (
          await Impact.findOne({ key: "public" }).lean() || {
            dogsHelped: 0,
            capsCollected: 0
          }
        )
      : demoImpact;

    return res.json({
      donations: donations.map(d => ({
        id: String(d._id || d.id),
        name: d.name,
        contact: d.contact || "",
        type: d.type,
        detail: d.detail,
        date: d.createdAt || d.date,
        status: d.status || "pendiente"
      })),
      impact,
      mode: databaseReady() ? "database" : "demo"
    });

  } catch (error) {
    console.error("Error cargando panel:", error);

    return res.status(500).json({
      error: "No se pudo cargar el panel."
    });
  }
});


// Actualiza el estado de una donación.
app.patch("/api/admin/donations/:id", requireAdmin, async (req, res) => {
  const status = req.body?.status;

  if (!["pendiente", "recibido", "verificado"].includes(status)) {
    return res.status(400).json({
      error: "Estado inválido."
    });
  }

  try {
    if (databaseReady()) {
      const updated = await Donation.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({
          error: "Aporte no encontrado."
        });
      }

    } else {
      const item = demoDonations.find(
        d => d.id === req.params.id
      );

      if (!item) {
        return res.status(404).json({
          error: "Aporte no encontrado en esta sesión."
        });
      }

      item.status = status;
    }

    return res.json({
      message: "Estado actualizado."
    });

  } catch (error) {
    console.error("Error actualizando aporte:", error);

    return res.status(400).json({
      error: "No se pudo actualizar el aporte."
    });
  }
});


// Actualiza las cifras de impacto.
app.put("/api/admin/impact", requireAdmin, async (req, res) => {
  const dogsHelped = Number(req.body?.dogsHelped);
  const capsCollected = Number(req.body?.capsCollected);

  if (
    !Number.isSafeInteger(dogsHelped) ||
    dogsHelped < 0 ||
    dogsHelped > 1000000 ||
    !Number.isSafeInteger(capsCollected) ||
    capsCollected < 0 ||
    capsCollected > 100000000
  ) {
    return res.status(400).json({
      error: "Ingresa cantidades enteras válidas."
    });
  }

  try {
    if (databaseReady()) {
      await Impact.findOneAndUpdate(
        { key: "public" },
        {
          dogsHelped,
          capsCollected,
          updatedAt: new Date()
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

    } else {
      demoImpact = {
        dogsHelped,
        capsCollected
      };
    }

    return res.json({
      message: "Impacto actualizado. Publica solo cifras que hayas verificado.",
      dogsHelped,
      capsCollected
    });

  } catch (error) {
    console.error("Error actualizando impacto:", error);

    return res.status(500).json({
      error: "No se pudo actualizar el impacto."
    });
  }
});


// ==========================================
// CHAT DE SAVEBEBI
// ==========================================

app.post("/api/chat", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string"
      ? req.body.message.trim().slice(0, 500)
      : "";

    if (!message) {
      return res.status(400).json({
        error: "Escribe una pregunta."
      });
    }

    const q = message.toLocaleLowerCase("es");

    let reply;

    // Preguntas sobre productos y precios.
    if (
      /precio|cu[aá]nto|vale|costo|producto|collar|correa|ropa|cama|cat[aá]logo/.test(q)
    ) {
      if (!databaseReady()) {
        return res.status(503).json({
          error: "No puedo consultar los productos porque la base de datos no está disponible."
        });
      }

      const products = await Product.find({
        active: true
      })
        .select("name price category")
        .lean();

      if (products.length === 0) {
        reply = "Por el momento no tenemos productos publicados en la tienda.";

      } else {
        const formatter = new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          maximumFractionDigits: 0
        });

        const productList = products.map(product => {
          return `${product.name} (${product.category}): ${formatter.format(product.price)}`;
        });

        reply = `Estos son los productos disponibles en SaveBebi: ${productList.join("; ")}. Puedes encontrarlos en la sección Productos.`;
      }

    } else if (
      /tapita|tapa plastica|recolecci[oó]n|reciclaje|c[aá]ncer|niñ|fundaci[oó]n/.test(q)
    ) {
      reply = "SaveBebi quiere impulsar una campaña de recolección de tapitas plásticas para apoyar iniciativas dirigidas a niños con cáncer. Lava y seca las tapitas y guárdalas limpias. Antes de llevarlas, verifica el punto de recepción y la fundación responsable. Aún no anunciamos una alianza ni un punto de entrega confirmado.";

    } else if (
      /ayuda|calle|perrito|perro|misi[oó]n|donaci[oó]n|impacto/.test(q)
    ) {
      reply = "SaveBebi busca unir las compras con el bienestar animal. La idea es destinar recursos para apoyar a perritos en situación de calle. Publicaremos los avances y las ayudas realizadas con transparencia.";

    } else if (
      /pedido|comprar|env[ií]o|entrega|pagar/.test(q)
    ) {
      reply = "Añade los productos al carrito y usa el botón para preparar tu pedido por WhatsApp. El equipo debe confirmar disponibilidad, costo de envío y forma de pago.";

    } else if (
      /hola|buenas|buenos d[ií]as|buenas tardes|buenas noches/.test(q)
    ) {
      reply = "¡Hola! Bienvenida/o a SaveBebi. Puedo orientarte sobre productos, precios, pedidos y nuestra misión de bienestar animal.";

    } else {
      reply = "Puedo ayudarte con los productos, precios, pedidos o la misión de SaveBebi. ¿Qué te gustaría saber?";
    }

    return res.json({
      reply,
      mode: "faq"
    });

  } catch (error) {
    console.error("Error en el chat:", error);

    return res.status(500).json({
      error: "No se pudo procesar tu pregunta."
    });
  }
});


// ==========================================
// CONEXIÓN A MONGODB E INICIO DEL SERVIDOR
// ==========================================

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);

      console.log("Base de datos utilizada:", mongoose.connection.name);
      console.log("Colección de usuarios:", User.collection.name);
      console.log("MongoDB conectado.");

    } catch (error) {
      console.error(
        "No se pudo conectar a MongoDB. Las funciones que necesitan la base de datos no estarán disponibles:",
        error.message
      );
    }

  } else {
    console.log(
      "MONGODB_URI no configurada. Las funciones que necesitan MongoDB no estarán disponibles."
    );
  }

  app.listen(PORT, () => {
    console.log(`SaveBebi listo en http://localhost:${PORT}`);
  });
}


// Página principal del backend.
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    mensaje: "Backend de SaveBebi funcionando."
  });
});

// Responde cuando una ruta no existe.
app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada."
  });
});
start();
