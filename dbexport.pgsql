--
-- PostgreSQL database dump
--

-- Dumped from database version 10.1
-- Dumped by pg_dump version 10.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: Match; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "Match" (
    "MatchID" bigint NOT NULL,
    "Challenger" "char"[],
    "Opponent" "char"[],
    "ChallengerTeam" "char"[],
    "OpponentTeam" "char"[],
    "Winner" "char"[],
    "AvgScoreTeamA" integer,
    "AvgScoreTeamB" integer
);


ALTER TABLE "Match" OWNER TO postgres;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "Message" (
    "User" "char"[],
    "Time" time with time zone,
    "Content" "char"[]
);


ALTER TABLE "Message" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "User" (
    "Email" text,
    "Username" text NOT NULL,
    "Password" text,
    "Wins" integer,
    "Loss" integer,
    "Draws" integer,
    "Total Score" integer,
    "MMR" integer
);


ALTER TABLE "User" OWNER TO postgres;

--
-- Data for Name: Match; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "Match" ("MatchID", "Challenger", "Opponent", "ChallengerTeam", "OpponentTeam", "Winner", "AvgScoreTeamA", "AvgScoreTeamB") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "Message" ("User", "Time", "Content") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "User" ("Email", "Username", "Password", "Wins", "Loss", "Draws", "Total Score", "MMR") FROM stdin;
masghar.bese15seecs@seecs.edu.pk	DarthVader	LaLaLand	45	0	5	100	4000
\.


--
-- Name: Match Match_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "Match"
    ADD CONSTRAINT "Match_pkey" PRIMARY KEY ("MatchID");


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("Username");


--
-- PostgreSQL database dump complete
--

