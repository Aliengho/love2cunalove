import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("love2cunalove.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password TEXT,
    name TEXT,
    province TEXT,
    gender TEXT,
    bio TEXT,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS friend_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sender_id, receiver_id)
  );

  CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER,
    user2_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // Auth Routes
  app.post("/api/register", (req, res) => {
    const { email, phone, password, name, province, gender } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO users (email, phone, password, name, province, gender) VALUES (?, ?, ?, ?, ?, ?)");
      const info = stmt.run(email, phone, password, name, province, gender);
      res.json({ success: true, userId: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/login", (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or phone
    const user = db.prepare("SELECT * FROM users WHERE (email = ? OR phone = ?) AND password = ?").get(identifier, identifier, password) as any;
    if (user) {
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, province: user.province } });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  });

  // Profile Routes
  app.get("/api/users", (req, res) => {
    const currentUserId = req.query.userId;
    const users = db.prepare("SELECT id, name, province, gender, bio, avatar FROM users WHERE id != ?").all(currentUserId);
    res.json(users);
  });

  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare("SELECT id, name, province, gender, bio, avatar FROM users WHERE id = ?").get(req.params.id);
    res.json(user);
  });

  // Friend Request Routes
  app.post("/api/friends/request", (req, res) => {
    const { senderId, receiverId } = req.body;
    try {
      db.prepare("INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)").run(senderId, receiverId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: "Pedido já enviado ou erro" });
    }
  });

  app.get("/api/friends/requests/:userId", (req, res) => {
    const requests = db.prepare(`
      SELECT fr.id, fr.sender_id, u.name, u.province 
      FROM friend_requests fr 
      JOIN users u ON fr.sender_id = u.id 
      WHERE fr.receiver_id = ? AND fr.status = 'pending'
    `).all(req.params.userId);
    res.json(requests);
  });

  app.post("/api/friends/respond", (req, res) => {
    const { requestId, status } = req.body; // status: 'accepted' or 'rejected'
    const request = db.prepare("SELECT * FROM friend_requests WHERE id = ?").get(requestId) as any;
    
    if (!request) return res.status(404).json({ error: "Pedido não encontrado" });

    db.prepare("UPDATE friend_requests SET status = ? WHERE id = ?").run(status, requestId);

    if (status === 'accepted') {
      const u1 = Math.min(request.sender_id, request.receiver_id);
      const u2 = Math.max(request.sender_id, request.receiver_id);
      try {
        db.prepare("INSERT INTO friendships (user1_id, user2_id) VALUES (?, ?)").run(u1, u2);
      } catch (e) {}
    }
    res.json({ success: true });
  });

  app.get("/api/friends/:userId", (req, res) => {
    const friends = db.prepare(`
      SELECT u.id, u.name, u.province, u.avatar 
      FROM friendships f
      JOIN users u ON (f.user1_id = u.id OR f.user2_id = u.id)
      WHERE (f.user1_id = ? OR f.user2_id = ?) AND u.id != ?
    `).all(req.params.userId, req.params.userId, req.params.userId);
    res.json(friends);
  });

  // Chat Routes
  app.get("/api/messages/:userId/:otherId", (req, res) => {
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(req.params.userId, req.params.otherId, req.params.otherId, req.params.userId);
    res.json(messages);
  });

  // WebSocket for Real-time Chat
  const clients = new Map<number, WebSocket>();

  wss.on("connection", (ws) => {
    let currentUserId: number | null = null;

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === "auth") {
        currentUserId = message.userId;
        clients.set(currentUserId!, ws);
      }

      if (message.type === "chat") {
        const { senderId, receiverId, content } = message;
        db.prepare("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)").run(senderId, receiverId, content);
        
        const recipientWs = clients.get(receiverId);
        if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
          recipientWs.send(JSON.stringify({
            type: "chat",
            senderId,
            content,
            timestamp: new Date().toISOString()
          }));
        }
      }
    });

    ws.on("close", () => {
      if (currentUserId) clients.delete(currentUserId);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
