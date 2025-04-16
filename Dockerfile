# Sử dụng PHP 8.2 làm base image
FROM php:8.3-fpm

# Cài đặt các dependencies cần thiết
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    supervisor \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . /var/www

# Cài đặt PHP dependencies
RUN composer install --optimize-autoloader --no-dev

# Cài đặt Node.js dependencies và build frontend
RUN npm install && npm run build

# Cấp quyền cho Laravel
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# Copy supervisor configuration
COPY ./docker/supervisor.conf /etc/supervisor/conf.d/laravel-worker.conf

# Expose port
EXPOSE 9000

# Start supervisor và php-fpm
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
