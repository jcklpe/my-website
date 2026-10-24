FROM wordpress:7.1.3-php8.3-apache@sha256:d42f63cb89ad0eab272c4b393164e63830d0df270009907919f7dcce52b1a20b

RUN apt-get update \
  && apt-get install -y --no-install-recommends default-mysql-client less unzip \
  && rm -rf /var/lib/apt/lists/*

RUN rm -rf /usr/src/wordpress/wp-content/plugins/akismet \
  /usr/src/wordpress/wp-content/plugins/hello.php \
  /usr/src/wordpress/wp-content/themes/twentytwentythree \
  /usr/src/wordpress/wp-content/themes/twentytwentyfour \
  /usr/src/wordpress/wp-content/themes/twentytwentyfive

RUN curl -o /usr/local/bin/wp https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
  && chmod +x /usr/local/bin/wp

COPY apps/cms/scripts/bootstrap-wordpress.sh /usr/local/bin/bootstrap-wordpress.sh
COPY apps/cms/scripts/docker-entrypoint.sh /usr/local/bin/project-entrypoint.sh
COPY apps/cms/config/uploads.ini /usr/local/etc/php/conf.d/project-uploads.ini
COPY apps/cms/config/security.ini /usr/local/etc/php/conf.d/project-security.ini
COPY apps/cms/config/security.conf /etc/apache2/conf-available/project-security.conf
RUN a2enconf project-security \
  && php -r 'if (version_compare(PHP_VERSION, "8.3.36", "<")) { exit(1); }'
RUN chmod +x /usr/local/bin/project-entrypoint.sh /usr/local/bin/bootstrap-wordpress.sh

ENTRYPOINT ["project-entrypoint.sh"]
CMD ["apache2-foreground"]
