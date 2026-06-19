# Stage 1: Build Expo web app
FROM node:20-alpine AS builder

WORKDIR /app

ARG EXPO_PUBLIC_API_BASE_URL
ENV EXPO_PUBLIC_API_BASE_URL=$EXPO_PUBLIC_API_BASE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN export EXPO_PUBLIC_API_BASE_URL="${EXPO_PUBLIC_API_BASE_URL:-https://digiwa-backend-1034235894897.asia-southeast2.run.app}" \
 && test -n "$EXPO_PUBLIC_API_BASE_URL" \
 && npx expo export --platform web

# Stage 2: Serve with nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
