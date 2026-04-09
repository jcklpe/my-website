#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

until wp db check --allow-root >/dev/null 2>&1; do
  echo "Waiting for database..."
  sleep 3
done

install_plugin() {
  local slug="$1"
  local version="$2"

  if wp plugin is-installed "$slug" --allow-root >/dev/null 2>&1; then
    wp plugin activate "$slug" --allow-root >/dev/null 2>&1 || true
    return 0
  fi

  if [ -n "$version" ] && [ "$version" != "latest" ]; then
    wp plugin install "$slug" --activate --version="$version" --allow-root
    return 0
  fi

  wp plugin install "$slug" --activate --allow-root
}

install_content_blocks_plugin() {
  local version="$1"
  local package_url=""

  if wp plugin is-installed wp-graphql-content-blocks --allow-root >/dev/null 2>&1; then
    wp plugin activate wp-graphql-content-blocks --allow-root >/dev/null 2>&1 || true
    return 0
  fi

  if [ -n "$version" ] && [ "$version" != "latest" ]; then
    package_url="https://github.com/wpengine/wp-graphql-content-blocks/releases/download/${version}/wp-graphql-content-blocks.zip"
  else
    package_url="https://github.com/wpengine/wp-graphql-content-blocks/releases/latest/download/wp-graphql-content-blocks.zip"
  fi

  wp plugin install "$package_url" --activate --allow-root
}

if ! wp core is-installed --allow-root >/dev/null 2>&1; then
  wp core install \
    --url="${WORDPRESS_URL}" \
    --title="${WORDPRESS_TITLE}" \
    --admin_user="${WORDPRESS_ADMIN_USER}" \
    --admin_password="${WORDPRESS_ADMIN_PASSWORD}" \
    --admin_email="${WORDPRESS_ADMIN_EMAIL}" \
    --skip-email \
    --allow-root
fi

wp option update home "${WORDPRESS_URL}" --allow-root
wp option update siteurl "${WORDPRESS_URL}" --allow-root
wp option update blogname "${WORDPRESS_TITLE}" --allow-root

install_plugin wp-graphql "${WPGRAPHQL_VERSION:-}"
install_content_blocks_plugin "${WPGRAPHQL_CONTENT_BLOCKS_VERSION:-}"

wp plugin activate project-bootstrap my-website-blocks --allow-root || true
wp theme activate my-website-editor-theme --allow-root || true

if ! wp post list --post_type=post --allow-root --field=ID | grep -q .; then
  wp post create \
    --post_type=post \
    --post_title="First sample post" \
    --post_name="first-sample-post" \
    --post_status=publish \
    --post_content='<!-- wp:paragraph --><p>This sample post proves the WordPress and Nuxt connection path.</p><!-- /wp:paragraph -->' \
    --allow-root
fi

if ! wp post list --post_type=page --name=home --allow-root --field=ID | grep -q .; then
  wp post create \
    --post_type=page \
    --post_title="A flexible website foundation for design-led work." \
    --post_name="home" \
    --post_status=publish \
    --post_content='<!-- wp:paragraph --><p>The homepage hero content is pulled from this page by default, so the frontend can stay WordPress-driven while still falling back safely when content is missing.</p><!-- /wp:paragraph -->' \
    --allow-root
fi
