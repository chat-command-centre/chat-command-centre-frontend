#!/usr/bin/env bash

# Source environment variables
set -a
source .env
set +a

# Stop and remove the container
if [ "$(docker ps -a -q -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Stopping and removing the database container: $DB_CONTAINER_NAME"
  docker stop $DB_CONTAINER_NAME
  docker rm $DB_CONTAINER_NAME
fi

# Remove the volume
if [ "$(docker volume ls -q -f name=$DB_VOLUME_NAME)" ]; then
  echo "Removing the database volume: $DB_VOLUME_NAME"
  docker volume rm $DB_VOLUME_NAME
fi