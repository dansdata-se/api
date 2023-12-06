# Note: This Dockerfile is used by
# the devcontainer AND by integration tests

FROM supabase/postgres:orioledb-15.1.0.137_amd64

# Simple password for local development
ENV POSTGRES_PASSWORD=password

# Step 2: Apply our manual modifications, allowing migrations to be applied
# (this could also be considered a zero state of the production environment,
# but it includes some manual sql that is specific to the supabase environment).

ADD init /docker-entrypoint-initdb.d/

# Workaround for
#     "root" execution of the PostgreSQL server is not permitted.
#     The server must be started under an unprivileged user ID to prevent
#     possible system security compromise.  See the documentation for
#     more information on how to properly start the server.
# USER postgres

EXPOSE 5432
CMD [ "postgres", "-c", "config_file=/etc/postgresql/postgresql.conf" ]
