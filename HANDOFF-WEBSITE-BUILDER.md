# Handoff для website-builder

## Проект

- Компания: PROIT
- Окружение: production-site / будущий production
- Домен: `proit.top`
- Локальная папка сайта: `/home/nick/projects/proit-top-site`
- Внутренняя папка с планами Hermes: `/home/nick/projects/proit-top` — не является публичным репозиторием и не включается в сайт.

## Целевая инфраструктура

- Hosting: Netlify
- Repository: GitHub, отдельный репозиторий для сайта; URL ещё не зафиксирован.
- Branch: `main`
- Предварительный стек: Astro + React island + Three.js/React Three Fiber + GSAP, если это подтвердится архитектурой.

## Обязательные ограничения

- В Git только сайт и публичная информация.
- Не коммитить `.env`, ключи, токены, пароли, сертификаты, заявки, клиентские данные, дампы, внутренние планы и непубличные URL.
- Production-секреты, если понадобятся, хранятся только в Netlify environment variables или секретном хранилище.
- До публикации проверить build, SEO, мобильную версию, accessibility, reduced motion, 3D-fallback и отсутствие секретов.

## SSH

Создан отдельный deploy key только для будущего репозитория сайта:

- локальный приватный ключ: `~/.ssh/proit-top-github-deploy` — не передавать и не добавлять в Git;
- публичный ключ Никита добавит в GitHub вручную;
- fingerprint: `SHA256:F/V0joG7ba1A2NVSyG1u44ynMsi+cUtEa01JZnLix5U`.

## Текущий статус

- Публичная рабочая папка создана.
- Git инициализирован на ветке `main`.
- Добавлены `.gitignore`, `README.md`, `SECURITY.md`.
- Код сайта пока не создавался.
- Не выполнены: подключение remote, push, Netlify site, DNS, аналитика.
