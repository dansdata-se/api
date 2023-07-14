-- CreateEnum
CREATE TYPE "profiles"."organization_tag" AS ENUM (
    'performer',
    'educator',
    'organizer',
    'photographer',
    'booking_agent'
);
-- CreateTable
CREATE TABLE "profiles"."organization_tags" (
    "tag" "profiles"."organization_tag" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "organization_tags_pkey" PRIMARY KEY ("tag")
);
-- Insert Values
INSERT INTO "profiles"."organization_tags"
VALUES (
        'performer',
        'Band/Artist',
        -- A band or an artist who may be booked for a performance
        'Band eller artist som kan bokas för ett uppträdande'
    ),
    (
        'educator',
        'Utbildare',
        -- A company or association offering dance classes
        'Företag eller förening som erbjuder dansutbildning'
    ),
    (
        'organizer',
        'Arrangör',
        -- A company or association that organizes events
        'Företag eller förening som arrangerar dansevenemang'
    ),
    (
        'photographer',
        'Fotograf',
        -- A company or association that captures photos at dance events
        'Företag eller förening som fotograferar vid dansevenemang'
    ),
    (
        'booking_agent',
        'Bokare',
        -- A company or association that handles band and artist bookings
        'Företag eller förening som samordnar bokningar för artister och band'
    );
-- CreateEnum
CREATE TYPE "profiles"."individual_tag" AS ENUM (
    'musician',
    'songwriter',
    'instructor',
    'organizer',
    'photographer'
);
-- CreateTable
CREATE TABLE "profiles"."individual_tags" (
    "tag" "profiles"."individual_tag" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "individual_tags_pkey" PRIMARY KEY ("tag")
);
-- Insert Values
INSERT INTO "profiles"."individual_tags"
VALUES (
        'musician',
        'Musiker',
        -- A person who performs music, with or without an instruments
        'Någon som utövar musik, med eller utan instrument'
    ),
    (
        'songwriter',
        'Låtskrivare',
        -- A person who writes music
        'Person som skriver musik'
    ),
    (
        'instructor',
        'Instruktör',
        -- A person who teaches dance
        'Person som utbildar i dans'
    ),
    (
        'organizer',
        'Arrangör',
        -- A person who organizes events
        'Enskild person som arrangerar dansevenemang'
    ),
    (
        'photographer',
        'Fotograf',
        -- A person who captures photos at dance events
        'Enskild person som fotograferar vid dansevenemang'
    );
