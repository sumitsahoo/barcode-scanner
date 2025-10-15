FROM node:24-alpine as build

ARG WORK_DIR=/app
ENV PATH $WORK_DIR/node_modules/.bin:$PATH
WORKDIR $WORK_DIR

COPY . .
RUN npm install
RUN mkdir node_modules/.cache && chmod -R 777 node_modules/.cache

RUN npm run build

FROM nginx:1.29.2-alpine
EXPOSE 8080

USER root
RUN mkdir /etc/nginx/cache && \
  mkdir /etc/nginx/cachetmp

COPY --from=build /app/dist /usr/share/nginx/html/.

RUN touch /var/run/nginx.pid
RUN chown 1000:1000 -R /var/cache/nginx/ /etc/nginx/ /var/run/nginx.pid
RUN sed -i 's/listen  .*/listen 8080;/g' /etc/nginx/conf.d/default.conf
RUN sed -i '/index  index.html index.htm.*/a \\ttry_files $uri /index.html;' /etc/nginx/conf.d/default.conf
USER 1000