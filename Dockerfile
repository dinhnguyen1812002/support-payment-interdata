
FROM php:8.3-fpm
ARG user=www-data
ARG uid=1000

# Install Laravel required extensions
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    supervisor \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim unzip git curl libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath gd

# Install composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create system user
RUN useradd -G www-data,root -u $uid -d /home/$user $user || true
RUN mkdir -p /home/$user/.composer && \
    chown -R $user:$user /home/$user

# Set working directory
WORKDIR /var/www

# Create storage directory structure
RUN mkdir -p /var/www/storage/app/public \
    /var/www/storage/framework/cache \
    /var/www/storage/framework/sessions \
    /var/www/storage/framework/testing \
    /var/www/storage/framework/views \
    /var/www/storage/logs \
    /var/www/bootstrap/cache

# Copy only necessary files (not the storage)
COPY --chown=$user:$user . /var/www

# Create public/storage symbolic link at runtime
RUN rm -rf /var/www/public/storage && \
    ln -s /var/www/storage/app/public /var/www/public/storage

# Fix permissions
RUN chown -R $user:$user /var/www/storage \
    /var/www/bootstrap/cache \
    /var/www/public \
    && chmod -R 775 /var/www/storage \
    /var/www/bootstrap/cache \
    /var/www/public

# Switch to non-root user
USER $user

# Expose PHP-FPM port
EXPOSE 9000
CMD ["php-fpm"]
