<p align="center">
  <img src="https://raw.githubusercontent.com/LavaxMaster/n8n-nodes-starter/master/nodes/UnderstandTechChat/understandtech_logo.svg" width="400"/>
</p>

# n8n-nodes-understandtechchat

Custom n8n integration nodes for **UnderstandTechChat**, enabling seamless interaction with your platform via authenticated API requests. Built using the [n8n community node starter template](https://github.com/n8n-io/n8n-nodes-starter).

## 🧠 What is UnderstandTechChat?

UnderstandTechChat is a powerful platform that connects users to their own customly trained model and allows you to chat with your model. This custom n8n node allows you to directly integrate and automate your UnderstandTechChat workflows within n8n.

---

## 🚀 Features

- Send messages and interact with the UnderstandTechChat API
- Use custom credentials and authentication
- Easily plug into any n8n workflow
- Includes support for multiple HTTP verbs and custom actions

---

## 📦 Installation

To install this node in your local or self-hosted n8n instance:

```bash
npm install n8n-nodes-understandtechchat
```

If you’re using Docker:

```Dockerfile
RUN npm install n8n-nodes-understandtechchat
```

Then restart your n8n instance.

---

## 📋 Prerequisites

You’ll need:

- [Git](https://git-scm.com/downloads)
- Node.js (v20 or later) and [pnpm](https://pnpm.io/)
- [n8n installed](https://docs.n8n.io/)
  
Install globally:
```bash
npm install -g n8n
```

---

## 🛠 Development Setup

1. Clone this repo:
   ```bash
   git clone https://github.com/LavaxMaster/n8n-nodes-starter.git
   cd n8n-nodes-starter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build and lint:
   ```bash
   npm run build
   npm run lint
   ```

4. Customize your logic inside:
   - `nodes/UnderstandTechChat/UnderstandTechChat.node.ts`
   - `credentials/UnderstandTechApiCredentials.credentials.ts`

---

## 🧪 Testing

You can run and test the node locally within n8n using:
```bash
n8n
```

Then, open the UI and test the `UnderstandTechChat` node in your workflow.

Refer to the [official guide](https://docs.n8n.io/integrations/creating-nodes/test/run-node-locally/) for running custom nodes locally.

---

## 🌍 Publishing to npm

When you're ready to share:

1. Update `package.json` fields:
   - `name`
   - `version`
   - `description`
   - `repository`

2. Build and lint:
   ```bash
   npm run build
   npm run lint
   ```

3. Publish:
   ```bash
   npm publish --access public
   ```

---

## 📄 License

[MIT License](LICENSE.md)