FROM mysql:8.0
COPY init.sql /docker-entrypoint-initdb.d/00-init.sql
CMD ["--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]
