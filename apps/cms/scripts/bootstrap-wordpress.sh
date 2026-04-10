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

install_private_plugin_zip() {
  local slug="$1"
  local zip_path="$2"

  if wp plugin is-installed "$slug" --allow-root >/dev/null 2>&1; then
    wp plugin activate "$slug" --allow-root >/dev/null 2>&1 || true
    return 0
  fi

  if [ ! -f "$zip_path" ]; then
    return 0
  fi

  wp plugin install "$zip_path" --activate --allow-root
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
install_private_plugin_zip "advanced-custom-fields-pro" "/private-plugins/advanced-custom-fields-pro.zip"

wp plugin activate project-bootstrap my-website-blocks --allow-root || true
wp theme activate my-website-editor-theme --allow-root || true

SITE_ICON_SOURCE="/var/www/html/wp-content/themes/my-website-editor-theme/assets/site-icon.jpg"
CURRENT_SITE_ICON_ID="$(wp option get site_icon --allow-root 2>/dev/null || true)"

if [ -f "${SITE_ICON_SOURCE}" ] && { [ -z "${CURRENT_SITE_ICON_ID}" ] || [ "${CURRENT_SITE_ICON_ID}" = "0" ]; }; then
  SITE_ICON_ATTACHMENT_ID="$(wp post list \
    --post_type=attachment \
    --name=site-icon \
    --field=ID \
    --allow-root | head -n 1)"

  if [ -z "${SITE_ICON_ATTACHMENT_ID}" ]; then
    SITE_ICON_ATTACHMENT_ID="$(wp media import \
      "${SITE_ICON_SOURCE}" \
      --title="Site Icon" \
      --porcelain \
      --allow-root)"
  fi

  if [ -n "${SITE_ICON_ATTACHMENT_ID}" ]; then
    wp option update site_icon "${SITE_ICON_ATTACHMENT_ID}" --allow-root
  fi
fi

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
    --post_title="Home" \
    --post_name="home" \
    --post_status=publish \
    --post_content='<!-- wp:paragraph --><p>The homepage hero content is pulled from this page by default, so the frontend can stay WordPress-driven while still falling back safely when content is missing.</p><!-- /wp:paragraph -->' \
    --allow-root
fi

HOME_PAGE_ID="$(wp post list --post_type=page --name=home --allow-root --field=ID | head -n 1)"

if [ -n "${HOME_PAGE_ID}" ]; then
  if [ -z "$(wp post meta get "${HOME_PAGE_ID}" hero_title --allow-root 2>/dev/null || true)" ]; then
    wp post meta update "${HOME_PAGE_ID}" hero_title "Title Text" --allow-root
  fi

  if [ -z "$(wp post meta get "${HOME_PAGE_ID}" hero_subtitle --allow-root 2>/dev/null || true)" ]; then
    wp post meta update "${HOME_PAGE_ID}" hero_subtitle "Subtitle text" --allow-root
  fi

  wp option update show_on_front page --allow-root
  wp option update page_on_front "${HOME_PAGE_ID}" --allow-root
fi
