# Sử dụng image PHP chính thức với phiên bản 8.2
FROM php:8.2-fpm

# Cài đặt các extension PHP cần thiết
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-install pdo_mysql zip

# Cài đặt Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Cài đặt Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Thiết lập thư mục làm việc
WORKDIR /var/www/html

# Sao chép mã nguồn ứng dụng
COPY . .

# Cài đặt các dependency PHP
RUN composer install --optimize-autoloader --no-dev

# Cài đặt các dependency JavaScript/TypeScript với Bun
RUN bun install

# Build frontend assets
RUN bun run build

# Quyền cho thư mục storage và cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expose cổng cho Laravel Reverb (WebSocket)
EXPOSE 8080

# Lệnh chạy PHP-FPM
CMD ["php-fpm"]
