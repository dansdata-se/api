# Note: This Dockerfile is used by
# the devcontainer AND by integration tests

FROM postgis/postgis:15-master

# Step 1: Recreate zero state of the production environment
# (i.e. as created by vercel)

ENV LC_COLLATE C
ENV LC_CTYPE C
ENV LC_MESSAGES=""
ENV LC_MONETARY C
ENV LC_NUMERIC C
ENV LC_TIME C

ENV POSTGRES_USER=default
ENV POSTGRES_DB=verceldb
# Simple password for local development
ENV POSTGRES_PASSWORD=postgres

# Step 2: Apply our manual modifications, allowing migrations to be applied
# (this could also be considered a zero state of the production environment,
# but it includes some manual sql that is specific to the vercel environment).

ADD init /docker-entrypoint-initdb.d/
