You should be able to build the same way as before. 

cd into starter 

npm install

# Copy environment variables
cp .env.example .env
# Edit .env and add your LLM API key

# Start PostgreSQL (skip if using a different database)
docker compose up -d

# Start development servers
npx turbo dev 

You will need a GOOGLE_AI_API_KEY in your .env

When I tested building from a fresh clone I had to refresh after initial viewing of the webpage for some reason.