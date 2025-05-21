docker compose down --remove-orphans

rm -r dist & npm run build

ollama serve

docker compose up -d