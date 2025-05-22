FROM php:8.3-fpm
ARG user
ARG uid

# Cài đặt các extension Laravel cần
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim unzip git curl libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath gd

# Cài composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set thư mục làm việc
WORKDIR /var/www

# Copy source code vào container
# After copying source
COPY . /var/www

# Fix permissions


# Expose cổng PHP-FPM
EXPOSE 9000
CMD ["php-fpm"]
