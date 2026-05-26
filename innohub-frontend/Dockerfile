# Frontend Dockerfile (innohub-frontend/Dockerfile)
FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_URL=/api
ARG VITE_GOOGLE_AUTH_URL=/api/auth/google
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_AUTH_URL=$VITE_GOOGLE_AUTH_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
