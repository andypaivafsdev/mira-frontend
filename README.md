EN:
# 🪑 Mira Móveis - Landing Page

A Single Page Application (SPA) developed for a high-end custom furniture brand. The project focuses on a minimalist interface, high performance, and fluid animations, featuring product catalogs, project showcases, and quote requests.

## 🚀 Technologies Used
* **React & Vite:** For an ultra-fast development environment and a production-optimized build.
* **Tailwind CSS v4:** Utility-first styling, ensuring an extremely lightweight CSS bundle.
* **Framer Motion:** Management of scroll-based animations and smooth component transitions.
* **Lucide React:** Vector icon library.

## ⚡ Optimizations Implemented
* **Lazy Loading:** Catalog and project images use `loading="lazy"`, loading only when they enter the user's viewport.
* **Memoization (React.memo & useCallback):** Heavy visual components and callback functions were stabilized to prevent unnecessary re-renders, keeping the application running at a smooth 60fps.
* **Mobile Autoplay Bypass:** Custom script to force background video playback on restrictive mobile browsers (like iOS Safari).

## 🔒 Next Steps: Security & Form Integration
The current contact form is in the UI (static Front-end) phase. For the functional email integration, the following security roadmap will be applied to protect the company's inbox:

1. **Anti-Spam Protection (Bots):** Implementation of invisible **reCAPTCHA v3** and/or a **Honeypot** technique (invisible field). This will ensure the inbox is not flooded by automated bots.
2. **API Key Protection:** Strict use of **environment variables (`.env`)** in the hosting service (Vercel/Netlify) to store messaging service tokens (e.g., EmailJS, SendGrid, Resend), ensuring keys are never exposed in the public source code.
3. **Backend Sanitization:** Delegating final data validation (email, phone) to a Serverless function, preventing any code injection attempts before the email is dispatched.
   


PT: 
# 🪑 Mira Móveis - Landing Page

Uma Single Page Application (SPA) desenvolvida para uma marcenaria de móveis planejados de alto padrão. O projeto foca em uma interface minimalista, alta performance e animações fluidas, oferecendo catálogos, exibição de projetos e solicitação de orçamentos.

## 🚀 Tecnologias Utilizadas
* **React & Vite:** Para um ambiente de desenvolvimento ultrarrápido e build otimizado para produção.
* **Tailwind CSS v4:** Estilização baseada em classes utilitárias, garantindo um bundle CSS extremamente leve.
* **Framer Motion:** Gerenciamento de animações baseadas em scroll e transições suaves entre componentes.
* **Lucide React:** Biblioteca de ícones vetoriais.

## ⚡ Otimizações Implementadas
* **Lazy Loading:** Imagens do catálogo e projetos possuem `loading="lazy"`, sendo baixadas apenas quando entram no campo de visão do usuário.
* **Memoização (React.memo & useCallback):** Componentes visuais pesados e funções de callback foram estabilizados para evitar re-renderizações desnecessárias e manter a aplicação rodando a 60fps.
* **Bypass de Autoplay Mobile:** Script customizado para forçar o carregamento do vídeo de background em navegadores mobile restritivos (como iOS Safari).

## 🔒 Próximos Passos: Segurança e Integração do Formulário
O formulário de contato atual encontra-se na fase de UI (Front-end estático). Para a integração funcional do envio de e-mails, o seguinte roadmap de segurança será aplicado para proteger a caixa de entrada da empresa:

1. **Proteção Anti-Spam (Bots):** Implementação de **reCAPTCHA v3** invisível e/ou técnica de **Honeypot** (campo invisível). Isso garantirá que a caixa de e-mail da Mira Móveis não seja inundada por bots automatizados.
2. **Proteção de Chaves de API:** Utilização estrita de **variáveis de ambiente (`.env`)** no serviço de hospedagem (Vercel/Netlify) para armazenar os tokens do serviço de mensageria (ex: EmailJS, SendGrid, Resend), garantindo que as chaves nunca sejam expostas no código público.
3. **Sanitização Backend:** Delegação da validação final dos dados (e-mail, telefone) para uma função Serverless, impedindo qualquer tentativa de injeção de código antes do disparo do e-mail.
