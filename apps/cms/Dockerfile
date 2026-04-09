FROM wordpress:6.9.4-php8.3-apache

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
RUN chmod +x /usr/local/bin/project-entrypoint.sh /usr/local/bin/bootstrap-wordpress.sh

ENTRYPOINT ["project-entrypoint.sh"]
CMD ["apache2-foreground"]
