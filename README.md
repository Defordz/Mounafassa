# Mounafassa Chatbot (Vercel-ready)

Chatbot juridique prêt à déployer sur Vercel.

## 1) Lancer en local

```bash
npm install
cp .env.example .env.local
# Ajoutez OPENAI_API_KEY
npm run dev
```

## 2) Déployer sur Vercel

1. Poussez le repo sur GitHub.
2. Importez le projet dans Vercel.
3. Ajoutez la variable d'environnement `OPENAI_API_KEY`.
4. Deploy.

## 3) Personnalisation

- Modifier le prompt dans `app/api/chat/route.ts`.
- Adapter couleurs/styles dans `app/globals.css` pour ressembler au site du Conseil.
