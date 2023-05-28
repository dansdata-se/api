-- CreateEnum
CREATE TYPE "profiles"."Tag" AS ENUM (
    'performer',
    'musician',
    'educator',
    'instructor',
    'organizer',
    'photographer',
    'booking_agent'
);
-- CreateTable
CREATE TABLE "profiles"."tags" (
    "tag" "profiles"."Tag" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "applies_to_organizations" BOOLEAN NOT NULL,
    "applies_to_individuals" BOOLEAN NOT NULL,
    "applies_to_venues" BOOLEAN NOT NULL,
    CONSTRAINT "tags_pkey" PRIMARY KEY ("tag")
);
INSERT INTO "profiles"."tags"
VALUES (
        'performer',
        'Band/Artist',
        -- An entity which may be booked for a performance
        'Grupp eller person som kan bokas för ett uppträdande',
        TRUE,
        TRUE,
        FALSE
    ),
    (
        'musician',
        'Musiker',
        -- An individual who performs music but may not be booked for a performance by themselves
        'Individ som jobbar med musik men inte självständigt kan bokas för uppträdanden',
        FALSE,
        TRUE,
        FALSE
    ),
    (
        'educator',
        'Utbildare',
        -- An entity offering dance classes
        'Grupp eller person som erbjuder dansutbildning',
        TRUE,
        TRUE,
        FALSE
    ),
    (
        'instructor',
        'Instruktör',
        -- An individual who teaches dance
        'Individ som utbildar i dans',
        FALSE,
        TRUE,
        FALSE
    ),
    (
        'organizer',
        'Arrangör',
        -- An entity that organizes events
        'Grupp eller person som arrangerar dansevenemang',
        TRUE,
        TRUE,
        FALSE
    ),
    (
        'photographer',
        'Fotograf',
        -- An entity that captures photos at dance events
        'Grupp eller person som fotograferar vid dansevenemang',
        TRUE,
        TRUE,
        FALSE
    ),
    (
        'booking_agent',
        'Bokare',
        -- An entity that handles bookings
        'Grupp eller person som samordnar bokningar för artister och band',
        TRUE,
        TRUE,
        FALSE
    );
