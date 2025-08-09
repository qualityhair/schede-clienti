--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: repmgr; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA repmgr;


ALTER SCHEMA repmgr OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: acquisti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.acquisti (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    prodotto character varying(255) NOT NULL,
    data_acquisto date NOT NULL,
    prezzo numeric(10,2) NOT NULL,
    quantita integer DEFAULT 1 NOT NULL,
    note text,
    pagato boolean DEFAULT false NOT NULL
);


ALTER TABLE public.acquisti OWNER TO postgres;

--
-- Name: acquisti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.acquisti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.acquisti_id_seq OWNER TO postgres;

--
-- Name: acquisti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.acquisti_id_seq OWNED BY public.acquisti.id;


--
-- Name: analisi_tricologiche; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analisi_tricologiche (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    data_analisi date DEFAULT CURRENT_DATE NOT NULL,
    data_nascita_cliente date,
    esigenza_cliente text,
    patologie_dichiarate text,
    frequenza_lavaggi character varying(50),
    presenza_prurito character varying(20),
    tappo_cheratosico boolean,
    stato_cute character varying(100),
    stato_capello character varying(100),
    tipologia_effluvio character varying(100),
    tipologia_alopecia character varying(100),
    estensione_alopecia character varying(50),
    diagnosi_riepilogo text,
    diagnosi_primaria character varying(100),
    piano_trattamenti text,
    piano_prodotti text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.analisi_tricologiche OWNER TO postgres;

--
-- Name: analisi_tricologiche_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analisi_tricologiche_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analisi_tricologiche_id_seq OWNER TO postgres;

--
-- Name: analisi_tricologiche_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analisi_tricologiche_id_seq OWNED BY public.analisi_tricologiche.id;


--
-- Name: app_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.app_sessions OWNER TO postgres;

--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calendar_events (
    google_event_id character varying(255) NOT NULL,
    summary text,
    description text,
    location text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    creator_email character varying(255),
    last_modified timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_all_day boolean DEFAULT false,
    color_id character varying(20)
);


ALTER TABLE public.calendar_events OWNER TO postgres;

--
-- Name: calendar_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calendar_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calendar_events_id_seq OWNER TO postgres;

--
-- Name: client_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_photos (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    file_path text NOT NULL,
    didascalia character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tags text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.client_photos OWNER TO postgres;

--
-- Name: client_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_photos_id_seq OWNER TO postgres;

--
-- Name: client_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_photos_id_seq OWNED BY public.client_photos.id;


--
-- Name: clienti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clienti (
    id integer NOT NULL,
    nome character varying(100),
    cognome character varying(100),
    telefono character varying(50),
    email character varying(100),
    preferenze_note text,
    storico_acquisti text,
    data_nascita date,
    soprannome character varying(255),
    tags text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.clienti OWNER TO postgres;

--
-- Name: clienti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clienti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clienti_id_seq OWNER TO postgres;

--
-- Name: clienti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clienti_id_seq OWNED BY public.clienti.id;


--
-- Name: impostazioni; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.impostazioni (
    chiave character varying(255) NOT NULL,
    valore text
);


ALTER TABLE public.impostazioni OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: trattamenti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trattamenti (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    tipo_trattamento character varying(100),
    descrizione text,
    data_trattamento date,
    note text,
    prezzo numeric(10,2),
    pagato boolean DEFAULT false NOT NULL
);


ALTER TABLE public.trattamenti OWNER TO postgres;

--
-- Name: trattamenti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trattamenti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trattamenti_id_seq OWNER TO postgres;

--
-- Name: trattamenti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trattamenti_id_seq OWNED BY public.trattamenti.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(255),
    google_id character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'Tabella per memorizzare gli utenti dell''applicazione';


--
-- Name: COLUMN users.username; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.username IS 'Nome utente, deve essere unico';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: acquisti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acquisti ALTER COLUMN id SET DEFAULT nextval('public.acquisti_id_seq'::regclass);


--
-- Name: analisi_tricologiche id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisi_tricologiche ALTER COLUMN id SET DEFAULT nextval('public.analisi_tricologiche_id_seq'::regclass);


--
-- Name: client_photos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_photos ALTER COLUMN id SET DEFAULT nextval('public.client_photos_id_seq'::regclass);


--
-- Name: clienti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clienti ALTER COLUMN id SET DEFAULT nextval('public.clienti_id_seq'::regclass);


--
-- Name: trattamenti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trattamenti ALTER COLUMN id SET DEFAULT nextval('public.trattamenti_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: acquisti; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.acquisti (id, cliente_id, prodotto, data_acquisto, prezzo, quantita, note, pagato) FROM stdin;
\.


--
-- Data for Name: analisi_tricologiche; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analisi_tricologiche (id, cliente_id, data_analisi, data_nascita_cliente, esigenza_cliente, patologie_dichiarate, frequenza_lavaggi, presenza_prurito, tappo_cheratosico, stato_cute, stato_capello, tipologia_effluvio, tipologia_alopecia, estensione_alopecia, diagnosi_riepilogo, diagnosi_primaria, piano_trattamenti, piano_prodotti, created_at, updated_at) FROM stdin;
1	517	2025-07-31	\N	lamenta prurito alla cute	peroblemi del sangue e assume il cumadin	Settimanale	Sì	t	Desquamazione	Sano	Nessuno	Nessuna	\N	prurito causato probabilmente da assunzione di farmaci (cumadin)	Anomalie del Cuoio Capelluto	applicazione fluido antistress + impacchi con Quality maschera argan per almeno 4 sett	Shampoo Quality + Quality Maschera argan 1 x sett	2025-07-31 15:23:20.813089+02	2025-07-31 16:55:07.570205+02
2	125	2025-07-31	\N	segnala prurito alla cute	nessuna	Trisettimanale	Sì	t	Ipercheratosi	Secco	Nessuno	Nessuna	\N	prurito dovuto a secchezza cutanea e ipercheratosi	Anomalie della Cheratinizzazione (Forfora)	maschera Argan Quality	sh Quality	2025-07-31 17:09:26.763147+02	2025-07-31 18:59:35.659595+02
4	228	2025-08-03	\N	piccola forfora e prurito	nessuna	Trisettimanale	No	f	Desquamazione	Sano	Nessuno	Androgenetica	Diffusa	causa del prurito da fattori esterni e detergenza non mirata	Anomalie della Cheratinizzazione (Forfora)	maschi Quality Argan 1x 3/4 mesi	sh Quality + masch. Quality Argan	2025-08-03 08:06:03.068139+02	2025-08-03 08:06:42.893567+02
3	18	2025-08-01	\N	Assottigliamento dei capelli con eccessiva caduta diffusa	Piastrinopenia con assunzione saltuaria di cortisone in dosi piu o meno forti	Settimanale	A volte	t	Eudermica	Trattato Chimicamente	Trattamenti Farmacologici		\N	Probabile causa della caduta dovuta al cortisone	Forme di Caduta Non Cicatriziale	Trattamento con Maschera Quality Argan e sh Quality per almeno 4 settimane	Quality maschera argan 1 x sett e Sh Quality	2025-08-01 14:00:23.811987+02	2025-08-05 13:04:18.127973+02
5	525	2025-08-06	\N	prurito e forfora	nessuna	Settimanale	Sì	t	Ipercheratosi	Sano	Nessuno	Nessuna	\N	prurito causato da ipercheratosi	Anomalie della Cheratinizzazione (Forfora)			2025-08-06 14:08:41.149251+02	2025-08-06 14:08:41.149251+02
6	115	2025-08-07	\N	prurito alla cute	nessuna	Bisettimanale	A volte	t	Ortocheratosi	Sano	Nessuno	Nessuna	\N	prurito causato da mancanza di irdatazione e detergenze sbagliate	Anomalie della Cheratinizzazione (Forfora)	maschera quality argan prima dello sh quality ogni taglio	sh quality	2025-08-07 17:50:03.751705+02	2025-08-07 18:47:21.308384+02
7	374	2025-08-07	\N	preoccupato per caduta capelli	nessuna	Bisettimanale	No	f	Desquamazione	Sano	Nessuno	Androgenetica	Circoscritta	probabile sviluppo di alopecia androgenetica	Forme di Caduta Cicatriziale	maschera quality Argan ad ogni taglio	sh Quality	2025-08-07 19:51:48.872591+02	2025-08-07 19:51:48.872591+02
\.


--
-- Data for Name: app_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_sessions (sid, sess, expire) FROM stdin;
wZ5ELwVi3i4ZND_QloYeBhY6T-Jj_8Vg	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-21T15:53:08.169Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":2}}	2025-08-21 17:53:38
kzaZtbdWAY-Vio6XvbxM-l7NS9QbrWb9	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-21T15:45:00.545Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":2}}	2025-08-21 18:13:51
yyxytM-TPWCJSLRTda-Hj3AGQ9mHcoeC	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-22T07:20:21.419Z","secure":false,"httpOnly":true,"domain":"localhost","path":"/","sameSite":"strict"}}	2025-08-22 09:38:53
a-Y6kIsm9ajDPPtQVl2ThDrRBgwoLKEA	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-22T08:01:54.771Z","secure":false,"httpOnly":true,"domain":"localhost","path":"/","sameSite":"strict"},"passport":{"user":2}}	2025-08-22 10:08:01
6Qty6DVPSic46qoyx0rUwLNydgeUi8hG	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-22T15:47:39.520Z","secure":false,"httpOnly":true,"domain":"localhost","path":"/","sameSite":"strict"},"passport":{"user":4}}	2025-08-22 15:47:40
fh3JtjgNdt4ixe0x7K09tqdhiZY3pe2D	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-09-03T06:01:33.545Z","secure":true,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":4}}	2025-09-03 06:34:18
L7hMTFuegSajoW-iE_c5suVw38JMMbsX	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-22T16:21:48.915Z","secure":true,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":4}}	2025-09-04 09:09:35
PkwUdUo4_IBSzoplaSp1X2mBfQDpOjnp	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-09-05T06:42:58.212Z","secure":false,"httpOnly":true,"domain":"localhost","path":"/","sameSite":"strict"},"passport":{"user":2}}	2025-09-08 14:59:51
ERexU6XU17G-1ztAW_V2ZYMkpfVWhkTE	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-21T17:01:45.845Z","secure":true,"httpOnly":true,"domain":"clienti.qualityhair.it","path":"/","sameSite":"none"},"passport":{"user":{"id":"117429691498289453079","displayName":"Quality Hair","name":{"familyName":"Hair","givenName":"Quality"},"emails":[{"value":"qualityhairbolzano@gmail.com","verified":true}],"photos":[{"value":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c"}],"provider":"google","_raw":"{\\n  \\"sub\\": \\"117429691498289453079\\",\\n  \\"name\\": \\"Quality Hair\\",\\n  \\"given_name\\": \\"Quality\\",\\n  \\"family_name\\": \\"Hair\\",\\n  \\"picture\\": \\"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0\\\\u003ds96-c\\",\\n  \\"email\\": \\"qualityhairbolzano@gmail.com\\",\\n  \\"email_verified\\": true\\n}","_json":{"sub":"117429691498289453079","name":"Quality Hair","given_name":"Quality","family_name":"Hair","picture":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c","email":"qualityhairbolzano@gmail.com","email_verified":true}}}}	2025-08-21 17:01:46
xQdisZKH-eeHhFnarVi46db60h6vOwE3	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-22T18:14:35.214Z","secure":true,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":4}}	2025-08-23 04:57:00
pMgXHJ1HSVnG69EOZN-1DWLHLNyJ3XlK	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-21T06:02:14.080Z","secure":true,"httpOnly":true,"path":"/"},"passport":{"user":{"id":"117429691498289453079","displayName":"Quality Hair","name":{"familyName":"Hair","givenName":"Quality"},"emails":[{"value":"qualityhairbolzano@gmail.com","verified":true}],"photos":[{"value":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c"}],"provider":"google","_raw":"{\\n  \\"sub\\": \\"117429691498289453079\\",\\n  \\"name\\": \\"Quality Hair\\",\\n  \\"given_name\\": \\"Quality\\",\\n  \\"family_name\\": \\"Hair\\",\\n  \\"picture\\": \\"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0\\\\u003ds96-c\\",\\n  \\"email\\": \\"qualityhairbolzano@gmail.com\\",\\n  \\"email_verified\\": true\\n}","_json":{"sub":"117429691498289453079","name":"Quality Hair","given_name":"Quality","family_name":"Hair","picture":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c","email":"qualityhairbolzano@gmail.com","email_verified":true}}}}	2025-08-21 06:05:23
BHlEHUwdEIBDcD8ojWzivdBWgwYHP4i_	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-24T07:45:30.963Z","secure":true,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":4}}	2025-09-07 08:26:24
-hZIYHMgEcHvVMWtivh0rFSz7zRkD-yS	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-24T15:51:00.248Z","secure":true,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":4}}	2025-09-07 15:21:51
kC0oSWqxufTk4H8w28mLFibrDK8A6nN4	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-22T05:59:27.232Z","secure":true,"httpOnly":true,"domain":"clienti.qualityhair.it","path":"/","sameSite":"none"},"passport":{"user":{"id":"117429691498289453079","displayName":"Quality Hair","name":{"familyName":"Hair","givenName":"Quality"},"emails":[{"value":"qualityhairbolzano@gmail.com","verified":true}],"photos":[{"value":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c"}],"provider":"google","_raw":"{\\n  \\"sub\\": \\"117429691498289453079\\",\\n  \\"name\\": \\"Quality Hair\\",\\n  \\"given_name\\": \\"Quality\\",\\n  \\"family_name\\": \\"Hair\\",\\n  \\"picture\\": \\"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0\\\\u003ds96-c\\",\\n  \\"email\\": \\"qualityhairbolzano@gmail.com\\",\\n  \\"email_verified\\": true\\n}","_json":{"sub":"117429691498289453079","name":"Quality Hair","given_name":"Quality","family_name":"Hair","picture":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c","email":"qualityhairbolzano@gmail.com","email_verified":true}}}}	2025-08-22 05:59:28
0mZejVmMKX2JhHdc1j80z-fIf3ScDD2v	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-21T12:34:56.223Z","secure":true,"httpOnly":true,"domain":"clienti.qualityhair.it","path":"/","sameSite":"none"},"passport":{"user":{"id":"117429691498289453079","displayName":"Quality Hair","name":{"familyName":"Hair","givenName":"Quality"},"emails":[{"value":"qualityhairbolzano@gmail.com","verified":true}],"photos":[{"value":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c"}],"provider":"google","_raw":"{\\n  \\"sub\\": \\"117429691498289453079\\",\\n  \\"name\\": \\"Quality Hair\\",\\n  \\"given_name\\": \\"Quality\\",\\n  \\"family_name\\": \\"Hair\\",\\n  \\"picture\\": \\"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0\\\\u003ds96-c\\",\\n  \\"email\\": \\"qualityhairbolzano@gmail.com\\",\\n  \\"email_verified\\": true\\n}","_json":{"sub":"117429691498289453079","name":"Quality Hair","given_name":"Quality","family_name":"Hair","picture":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c","email":"qualityhairbolzano@gmail.com","email_verified":true}}}}	2025-08-21 12:34:57
uDW9ezW1-Q1foQAStQcfc1ohOIWW1yjt	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-21T12:35:10.099Z","secure":true,"httpOnly":true,"domain":"clienti.qualityhair.it","path":"/","sameSite":"none"},"passport":{"user":{"id":"117429691498289453079","displayName":"Quality Hair","name":{"familyName":"Hair","givenName":"Quality"},"emails":[{"value":"qualityhairbolzano@gmail.com","verified":true}],"photos":[{"value":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c"}],"provider":"google","_raw":"{\\n  \\"sub\\": \\"117429691498289453079\\",\\n  \\"name\\": \\"Quality Hair\\",\\n  \\"given_name\\": \\"Quality\\",\\n  \\"family_name\\": \\"Hair\\",\\n  \\"picture\\": \\"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0\\\\u003ds96-c\\",\\n  \\"email\\": \\"qualityhairbolzano@gmail.com\\",\\n  \\"email_verified\\": true\\n}","_json":{"sub":"117429691498289453079","name":"Quality Hair","given_name":"Quality","family_name":"Hair","picture":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c","email":"qualityhairbolzano@gmail.com","email_verified":true}}}}	2025-08-21 12:35:11
LvJC2X5VJTsf09hKgi7yiNw6AWpV5bna	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-23T04:57:06.929Z","secure":true,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":4}}	2025-08-23 04:57:27
MqzW-7Bg-Ajcc_ftzm7pST0PYZqGEJzI	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-21T06:45:03.591Z","secure":true,"httpOnly":true,"domain":"clienti.qualityhair.it","path":"/","sameSite":"none"},"passport":{"user":{"id":"117429691498289453079","displayName":"Quality Hair","name":{"familyName":"Hair","givenName":"Quality"},"emails":[{"value":"qualityhairbolzano@gmail.com","verified":true}],"photos":[{"value":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c"}],"provider":"google","_raw":"{\\n  \\"sub\\": \\"117429691498289453079\\",\\n  \\"name\\": \\"Quality Hair\\",\\n  \\"given_name\\": \\"Quality\\",\\n  \\"family_name\\": \\"Hair\\",\\n  \\"picture\\": \\"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0\\\\u003ds96-c\\",\\n  \\"email\\": \\"qualityhairbolzano@gmail.com\\",\\n  \\"email_verified\\": true\\n}","_json":{"sub":"117429691498289453079","name":"Quality Hair","given_name":"Quality","family_name":"Hair","picture":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c","email":"qualityhairbolzano@gmail.com","email_verified":true}}}}	2025-08-21 06:45:04
ku2MSY-QaiSqc0C_hrHMCC80B5cZvQ2F	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-21T06:45:38.627Z","secure":true,"httpOnly":true,"domain":"clienti.qualityhair.it","path":"/","sameSite":"none"},"passport":{"user":{"id":"117429691498289453079","displayName":"Quality Hair","name":{"familyName":"Hair","givenName":"Quality"},"emails":[{"value":"qualityhairbolzano@gmail.com","verified":true}],"photos":[{"value":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c"}],"provider":"google","_raw":"{\\n  \\"sub\\": \\"117429691498289453079\\",\\n  \\"name\\": \\"Quality Hair\\",\\n  \\"given_name\\": \\"Quality\\",\\n  \\"family_name\\": \\"Hair\\",\\n  \\"picture\\": \\"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0\\\\u003ds96-c\\",\\n  \\"email\\": \\"qualityhairbolzano@gmail.com\\",\\n  \\"email_verified\\": true\\n}","_json":{"sub":"117429691498289453079","name":"Quality Hair","given_name":"Quality","family_name":"Hair","picture":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c","email":"qualityhairbolzano@gmail.com","email_verified":true}}}}	2025-08-21 06:45:39
NoCfSn9pC-luQeZ_sG-qn93Im3-nYNcd	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-22T05:59:41.452Z","secure":true,"httpOnly":true,"domain":"clienti.qualityhair.it","path":"/","sameSite":"none"},"passport":{"user":{"id":"117429691498289453079","displayName":"Quality Hair","name":{"familyName":"Hair","givenName":"Quality"},"emails":[{"value":"qualityhairbolzano@gmail.com","verified":true}],"photos":[{"value":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c"}],"provider":"google","_raw":"{\\n  \\"sub\\": \\"117429691498289453079\\",\\n  \\"name\\": \\"Quality Hair\\",\\n  \\"given_name\\": \\"Quality\\",\\n  \\"family_name\\": \\"Hair\\",\\n  \\"picture\\": \\"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0\\\\u003ds96-c\\",\\n  \\"email\\": \\"qualityhairbolzano@gmail.com\\",\\n  \\"email_verified\\": true\\n}","_json":{"sub":"117429691498289453079","name":"Quality Hair","given_name":"Quality","family_name":"Hair","picture":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c","email":"qualityhairbolzano@gmail.com","email_verified":true}}}}	2025-08-22 05:59:42
u2HO6CK6kdnHg_Q072rIRk4ndHvBioW7	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-21T13:34:30.420Z","secure":true,"httpOnly":true,"domain":"clienti.qualityhair.it","path":"/","sameSite":"none"},"passport":{"user":{"id":"117429691498289453079","displayName":"Quality Hair","name":{"familyName":"Hair","givenName":"Quality"},"emails":[{"value":"qualityhairbolzano@gmail.com","verified":true}],"photos":[{"value":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c"}],"provider":"google","_raw":"{\\n  \\"sub\\": \\"117429691498289453079\\",\\n  \\"name\\": \\"Quality Hair\\",\\n  \\"given_name\\": \\"Quality\\",\\n  \\"family_name\\": \\"Hair\\",\\n  \\"picture\\": \\"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0\\\\u003ds96-c\\",\\n  \\"email\\": \\"qualityhairbolzano@gmail.com\\",\\n  \\"email_verified\\": true\\n}","_json":{"sub":"117429691498289453079","name":"Quality Hair","given_name":"Quality","family_name":"Hair","picture":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c","email":"qualityhairbolzano@gmail.com","email_verified":true}}}}	2025-08-21 13:34:31
oSyxKnpLCyTYbQLm2ZfpBn_lnuyx12Wm	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-21T13:34:46.625Z","secure":true,"httpOnly":true,"domain":"clienti.qualityhair.it","path":"/","sameSite":"none"},"passport":{"user":{"id":"117429691498289453079","displayName":"Quality Hair","name":{"familyName":"Hair","givenName":"Quality"},"emails":[{"value":"qualityhairbolzano@gmail.com","verified":true}],"photos":[{"value":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c"}],"provider":"google","_raw":"{\\n  \\"sub\\": \\"117429691498289453079\\",\\n  \\"name\\": \\"Quality Hair\\",\\n  \\"given_name\\": \\"Quality\\",\\n  \\"family_name\\": \\"Hair\\",\\n  \\"picture\\": \\"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0\\\\u003ds96-c\\",\\n  \\"email\\": \\"qualityhairbolzano@gmail.com\\",\\n  \\"email_verified\\": true\\n}","_json":{"sub":"117429691498289453079","name":"Quality Hair","given_name":"Quality","family_name":"Hair","picture":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c","email":"qualityhairbolzano@gmail.com","email_verified":true}}}}	2025-08-21 13:34:47
EN63yCx_pQxoLqs3GZ2FmvRiyYEeGlzr	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-23T04:57:32.112Z","secure":true,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":4}}	2025-08-23 04:58:06
rYqCR9IRWD13HVjJDaPy0--SGGZzgGzK	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-22T06:19:37.031Z","secure":true,"httpOnly":true,"domain":"clienti.qualityhair.it","path":"/","sameSite":"none"},"passport":{"user":{"id":"117429691498289453079","displayName":"Quality Hair","name":{"familyName":"Hair","givenName":"Quality"},"emails":[{"value":"qualityhairbolzano@gmail.com","verified":true}],"photos":[{"value":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c"}],"provider":"google","_raw":"{\\n  \\"sub\\": \\"117429691498289453079\\",\\n  \\"name\\": \\"Quality Hair\\",\\n  \\"given_name\\": \\"Quality\\",\\n  \\"family_name\\": \\"Hair\\",\\n  \\"picture\\": \\"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0\\\\u003ds96-c\\",\\n  \\"email\\": \\"qualityhairbolzano@gmail.com\\",\\n  \\"email_verified\\": true\\n}","_json":{"sub":"117429691498289453079","name":"Quality Hair","given_name":"Quality","family_name":"Hair","picture":"https://lh3.googleusercontent.com/a/ACg8ocLzKf4u9bmrlM9CX_muXqSMicRDSAo3Padl3eDTvkizuD2NeV0=s96-c","email":"qualityhairbolzano@gmail.com","email_verified":true}}}}	2025-08-22 06:19:38
a0ohnEsXZjg-whfjHmQoNRISn3Lgc2XZ	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-22T15:36:53.013Z","secure":false,"httpOnly":true,"domain":"localhost","path":"/","sameSite":"strict"},"passport":{"user":4}}	2025-08-22 15:36:54
Y2r9TVCTx1pVzMskOmhJgffB5Sup0LoB	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-22T15:37:16.637Z","secure":false,"httpOnly":true,"domain":"localhost","path":"/","sameSite":"strict"},"passport":{"user":4}}	2025-08-22 15:37:17
\.


--
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calendar_events (google_event_id, summary, description, location, start_time, end_time, creator_email, last_modified, created_at, updated_at, is_all_day, color_id) FROM stdin;
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250629	Chiusura settimanale	\N	\N	2025-06-29 00:00:00+02	2025-06-30 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.810022+02	2025-07-29 14:51:23.810022+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250630	Chiusura settimanale	\N	\N	2025-06-30 00:00:00+02	2025-07-01 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.816346+02	2025-07-29 14:51:23.816346+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250706	Chiusura settimanale	\N	\N	2025-07-06 00:00:00+02	2025-07-07 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.818514+02	2025-07-29 14:51:23.818514+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250707	Chiusura settimanale	\N	\N	2025-07-07 00:00:00+02	2025-07-08 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.820366+02	2025-07-29 14:51:23.820366+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250713	Chiusura settimanale	\N	\N	2025-07-13 00:00:00+02	2025-07-14 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.822395+02	2025-07-29 14:51:23.822395+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250714	Chiusura settimanale	\N	\N	2025-07-14 00:00:00+02	2025-07-15 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.824425+02	2025-07-29 14:51:23.824425+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250720	Chiusura settimanale	\N	\N	2025-07-20 00:00:00+02	2025-07-21 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.826601+02	2025-07-29 14:51:23.826601+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250721	Chiusura settimanale	\N	\N	2025-07-21 00:00:00+02	2025-07-22 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.828688+02	2025-07-29 14:51:23.828688+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250727	Chiusura settimanale	\N	\N	2025-07-27 00:00:00+02	2025-07-28 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.830947+02	2025-07-29 14:51:23.830947+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250728	Chiusura settimanale	\N	\N	2025-07-28 00:00:00+02	2025-07-29 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.832826+02	2025-07-29 14:51:23.832826+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250803	Chiusura settimanale	\N	\N	2025-08-03 00:00:00+02	2025-08-04 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.834393+02	2025-07-29 14:51:23.834393+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250804	Chiusura settimanale	\N	\N	2025-08-04 00:00:00+02	2025-08-05 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.835895+02	2025-07-29 14:51:23.835895+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250810	Chiusura settimanale	\N	\N	2025-08-10 00:00:00+02	2025-08-11 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.837335+02	2025-07-29 14:51:23.837335+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250811	Chiusura settimanale	\N	\N	2025-08-11 00:00:00+02	2025-08-12 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.838856+02	2025-07-29 14:51:23.838856+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250817	Chiusura settimanale	\N	\N	2025-08-17 00:00:00+02	2025-08-18 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.841002+02	2025-07-29 14:51:23.841002+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250818	Chiusura settimanale	\N	\N	2025-08-18 00:00:00+02	2025-08-19 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.842696+02	2025-07-29 14:51:23.842696+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250824	Chiusura settimanale	\N	\N	2025-08-24 00:00:00+02	2025-08-25 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.844202+02	2025-07-29 14:51:23.844202+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250825	Chiusura settimanale	\N	\N	2025-08-25 00:00:00+02	2025-08-26 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.84568+02	2025-07-29 14:51:23.84568+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250831	Chiusura settimanale	\N	\N	2025-08-31 00:00:00+02	2025-09-01 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.847152+02	2025-07-29 14:51:23.847152+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250901	Chiusura settimanale	\N	\N	2025-09-01 00:00:00+02	2025-09-02 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.848635+02	2025-07-29 14:51:23.848635+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250907	Chiusura settimanale	\N	\N	2025-09-07 00:00:00+02	2025-09-08 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.850071+02	2025-07-29 14:51:23.850071+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250908	Chiusura settimanale	\N	\N	2025-09-08 00:00:00+02	2025-09-09 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.85148+02	2025-07-29 14:51:23.85148+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250914	Chiusura settimanale	\N	\N	2025-09-14 00:00:00+02	2025-09-15 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.852884+02	2025-07-29 14:51:23.852884+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250915	Chiusura settimanale	\N	\N	2025-09-15 00:00:00+02	2025-09-16 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.854847+02	2025-07-29 14:51:23.854847+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250921	Chiusura settimanale	\N	\N	2025-09-21 00:00:00+02	2025-09-22 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.856629+02	2025-07-29 14:51:23.856629+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250922	Chiusura settimanale	\N	\N	2025-09-22 00:00:00+02	2025-09-23 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.858222+02	2025-07-29 14:51:23.858222+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250928	Chiusura settimanale	\N	\N	2025-09-28 00:00:00+02	2025-09-29 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.859744+02	2025-07-29 14:51:23.859744+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20250929	Chiusura settimanale	\N	\N	2025-09-29 00:00:00+02	2025-09-30 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.861309+02	2025-07-29 14:51:23.861309+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251005	Chiusura settimanale	\N	\N	2025-10-05 00:00:00+02	2025-10-06 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.862754+02	2025-07-29 14:51:23.862754+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251006	Chiusura settimanale	\N	\N	2025-10-06 00:00:00+02	2025-10-07 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.864201+02	2025-07-29 14:51:23.864201+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251012	Chiusura settimanale	\N	\N	2025-10-12 00:00:00+02	2025-10-13 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.865622+02	2025-07-29 14:51:23.865622+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251013	Chiusura settimanale	\N	\N	2025-10-13 00:00:00+02	2025-10-14 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.867064+02	2025-07-29 14:51:23.867064+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251019	Chiusura settimanale	\N	\N	2025-10-19 00:00:00+02	2025-10-20 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.868457+02	2025-07-29 14:51:23.868457+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251020	Chiusura settimanale	\N	\N	2025-10-20 00:00:00+02	2025-10-21 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.869775+02	2025-07-29 14:51:23.869775+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251026	Chiusura settimanale	\N	\N	2025-10-26 00:00:00+02	2025-10-27 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.871027+02	2025-07-29 14:51:23.871027+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251027	Chiusura settimanale	\N	\N	2025-10-27 00:00:00+01	2025-10-28 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.872485+02	2025-07-29 14:51:23.872485+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251102	Chiusura settimanale	\N	\N	2025-11-02 00:00:00+01	2025-11-03 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.873998+02	2025-07-29 14:51:23.873998+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251103	Chiusura settimanale	\N	\N	2025-11-03 00:00:00+01	2025-11-04 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.875277+02	2025-07-29 14:51:23.875277+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251109	Chiusura settimanale	\N	\N	2025-11-09 00:00:00+01	2025-11-10 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.876512+02	2025-07-29 14:51:23.876512+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251110	Chiusura settimanale	\N	\N	2025-11-10 00:00:00+01	2025-11-11 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.879383+02	2025-07-29 14:51:23.879383+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251116	Chiusura settimanale	\N	\N	2025-11-16 00:00:00+01	2025-11-17 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.880706+02	2025-07-29 14:51:23.880706+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251117	Chiusura settimanale	\N	\N	2025-11-17 00:00:00+01	2025-11-18 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.881956+02	2025-07-29 14:51:23.881956+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251123	Chiusura settimanale	\N	\N	2025-11-23 00:00:00+01	2025-11-24 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.883181+02	2025-07-29 14:51:23.883181+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251124	Chiusura settimanale	\N	\N	2025-11-24 00:00:00+01	2025-11-25 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.884411+02	2025-07-29 14:51:23.884411+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251130	Chiusura settimanale	\N	\N	2025-11-30 00:00:00+01	2025-12-01 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.885618+02	2025-07-29 14:51:23.885618+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251201	Chiusura settimanale	\N	\N	2025-12-01 00:00:00+01	2025-12-02 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.886879+02	2025-07-29 14:51:23.886879+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251207	Chiusura settimanale	\N	\N	2025-12-07 00:00:00+01	2025-12-08 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.88826+02	2025-07-29 14:51:23.88826+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251208	Chiusura settimanale	\N	\N	2025-12-08 00:00:00+01	2025-12-09 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.889717+02	2025-07-29 14:51:23.889717+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251214	Chiusura settimanale	\N	\N	2025-12-14 00:00:00+01	2025-12-15 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.891071+02	2025-07-29 14:51:23.891071+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251215	Chiusura settimanale	\N	\N	2025-12-15 00:00:00+01	2025-12-16 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.892583+02	2025-07-29 14:51:23.892583+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251221	Chiusura settimanale	\N	\N	2025-12-21 00:00:00+01	2025-12-22 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.893884+02	2025-07-29 14:51:23.893884+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251222	Chiusura settimanale	\N	\N	2025-12-22 00:00:00+01	2025-12-23 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.895157+02	2025-07-29 14:51:23.895157+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251228	Chiusura settimanale	\N	\N	2025-12-28 00:00:00+01	2025-12-29 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.896371+02	2025-07-29 14:51:23.896371+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20251229	Chiusura settimanale	\N	\N	2025-12-29 00:00:00+01	2025-12-30 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.89758+02	2025-07-29 14:51:23.89758+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260104	Chiusura settimanale	\N	\N	2026-01-04 00:00:00+01	2026-01-05 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.898798+02	2025-07-29 14:51:23.898798+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260105	Chiusura settimanale	\N	\N	2026-01-05 00:00:00+01	2026-01-06 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.900022+02	2025-07-29 14:51:23.900022+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260111	Chiusura settimanale	\N	\N	2026-01-11 00:00:00+01	2026-01-12 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.901211+02	2025-07-29 14:51:23.901211+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260112	Chiusura settimanale	\N	\N	2026-01-12 00:00:00+01	2026-01-13 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.902409+02	2025-07-29 14:51:23.902409+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260118	Chiusura settimanale	\N	\N	2026-01-18 00:00:00+01	2026-01-19 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.903681+02	2025-07-29 14:51:23.903681+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260119	Chiusura settimanale	\N	\N	2026-01-19 00:00:00+01	2026-01-20 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.904937+02	2025-07-29 14:51:23.904937+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260125	Chiusura settimanale	\N	\N	2026-01-25 00:00:00+01	2026-01-26 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.906227+02	2025-07-29 14:51:23.906227+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260126	Chiusura settimanale	\N	\N	2026-01-26 00:00:00+01	2026-01-27 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.907639+02	2025-07-29 14:51:23.907639+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260201	Chiusura settimanale	\N	\N	2026-02-01 00:00:00+01	2026-02-02 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.908859+02	2025-07-29 14:51:23.908859+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260202	Chiusura settimanale	\N	\N	2026-02-02 00:00:00+01	2026-02-03 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.910233+02	2025-07-29 14:51:23.910233+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260208	Chiusura settimanale	\N	\N	2026-02-08 00:00:00+01	2026-02-09 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.911549+02	2025-07-29 14:51:23.911549+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260209	Chiusura settimanale	\N	\N	2026-02-09 00:00:00+01	2026-02-10 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.912799+02	2025-07-29 14:51:23.912799+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260215	Chiusura settimanale	\N	\N	2026-02-15 00:00:00+01	2026-02-16 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.914012+02	2025-07-29 14:51:23.914012+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260216	Chiusura settimanale	\N	\N	2026-02-16 00:00:00+01	2026-02-17 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.915226+02	2025-07-29 14:51:23.915226+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260222	Chiusura settimanale	\N	\N	2026-02-22 00:00:00+01	2026-02-23 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.916422+02	2025-07-29 14:51:23.916422+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260223	Chiusura settimanale	\N	\N	2026-02-23 00:00:00+01	2026-02-24 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.917619+02	2025-07-29 14:51:23.917619+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260301	Chiusura settimanale	\N	\N	2026-03-01 00:00:00+01	2026-03-02 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.918805+02	2025-07-29 14:51:23.918805+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260302	Chiusura settimanale	\N	\N	2026-03-02 00:00:00+01	2026-03-03 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.920141+02	2025-07-29 14:51:23.920141+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260308	Chiusura settimanale	\N	\N	2026-03-08 00:00:00+01	2026-03-09 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.921345+02	2025-07-29 14:51:23.921345+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260309	Chiusura settimanale	\N	\N	2026-03-09 00:00:00+01	2026-03-10 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.922626+02	2025-07-29 14:51:23.922626+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260315	Chiusura settimanale	\N	\N	2026-03-15 00:00:00+01	2026-03-16 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.924051+02	2025-07-29 14:51:23.924051+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260316	Chiusura settimanale	\N	\N	2026-03-16 00:00:00+01	2026-03-17 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.925314+02	2025-07-29 14:51:23.925314+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260322	Chiusura settimanale	\N	\N	2026-03-22 00:00:00+01	2026-03-23 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.926543+02	2025-07-29 14:51:23.926543+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260323	Chiusura settimanale	\N	\N	2026-03-23 00:00:00+01	2026-03-24 00:00:00+01	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.927863+02	2025-07-29 14:51:23.927863+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260329	Chiusura settimanale	\N	\N	2026-03-29 00:00:00+01	2026-03-30 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.929229+02	2025-07-29 14:51:23.929229+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260330	Chiusura settimanale	\N	\N	2026-03-30 00:00:00+02	2026-03-31 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.930992+02	2025-07-29 14:51:23.930992+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260405	Chiusura settimanale	\N	\N	2026-04-05 00:00:00+02	2026-04-06 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.932637+02	2025-07-29 14:51:23.932637+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260406	Chiusura settimanale	\N	\N	2026-04-06 00:00:00+02	2026-04-07 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.93407+02	2025-07-29 14:51:23.93407+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260412	Chiusura settimanale	\N	\N	2026-04-12 00:00:00+02	2026-04-13 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.935332+02	2025-07-29 14:51:23.935332+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260413	Chiusura settimanale	\N	\N	2026-04-13 00:00:00+02	2026-04-14 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.936607+02	2025-07-29 14:51:23.936607+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260419	Chiusura settimanale	\N	\N	2026-04-19 00:00:00+02	2026-04-20 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.937844+02	2025-07-29 14:51:23.937844+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260420	Chiusura settimanale	\N	\N	2026-04-20 00:00:00+02	2026-04-21 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.939061+02	2025-07-29 14:51:23.939061+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260426	Chiusura settimanale	\N	\N	2026-04-26 00:00:00+02	2026-04-27 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.940589+02	2025-07-29 14:51:23.940589+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260427	Chiusura settimanale	\N	\N	2026-04-27 00:00:00+02	2026-04-28 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.941937+02	2025-07-29 14:51:23.941937+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260503	Chiusura settimanale	\N	\N	2026-05-03 00:00:00+02	2026-05-04 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.943204+02	2025-07-29 14:51:23.943204+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260504	Chiusura settimanale	\N	\N	2026-05-04 00:00:00+02	2026-05-05 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.944444+02	2025-07-29 14:51:23.944444+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260510	Chiusura settimanale	\N	\N	2026-05-10 00:00:00+02	2026-05-11 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.945671+02	2025-07-29 14:51:23.945671+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260511	Chiusura settimanale	\N	\N	2026-05-11 00:00:00+02	2026-05-12 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.9469+02	2025-07-29 14:51:23.9469+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260517	Chiusura settimanale	\N	\N	2026-05-17 00:00:00+02	2026-05-18 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.948095+02	2025-07-29 14:51:23.948095+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260518	Chiusura settimanale	\N	\N	2026-05-18 00:00:00+02	2026-05-19 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.949298+02	2025-07-29 14:51:23.949298+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260524	Chiusura settimanale	\N	\N	2026-05-24 00:00:00+02	2026-05-25 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.950846+02	2025-07-29 14:51:23.950846+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260525	Chiusura settimanale	\N	\N	2026-05-25 00:00:00+02	2026-05-26 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.95225+02	2025-07-29 14:51:23.95225+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260531	Chiusura settimanale	\N	\N	2026-05-31 00:00:00+02	2026-06-01 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.953485+02	2025-07-29 14:51:23.953485+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260601	Chiusura settimanale	\N	\N	2026-06-01 00:00:00+02	2026-06-02 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.954693+02	2025-07-29 14:51:23.954693+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260607	Chiusura settimanale	\N	\N	2026-06-07 00:00:00+02	2026-06-08 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.957747+02	2025-07-29 14:51:23.957747+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260608	Chiusura settimanale	\N	\N	2026-06-08 00:00:00+02	2026-06-09 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.959151+02	2025-07-29 14:51:23.959151+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260614	Chiusura settimanale	\N	\N	2026-06-14 00:00:00+02	2026-06-15 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.960405+02	2025-07-29 14:51:23.960405+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260615	Chiusura settimanale	\N	\N	2026-06-15 00:00:00+02	2026-06-16 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.961738+02	2025-07-29 14:51:23.961738+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260621	Chiusura settimanale	\N	\N	2026-06-21 00:00:00+02	2026-06-22 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.963342+02	2025-07-29 14:51:23.963342+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260622	Chiusura settimanale	\N	\N	2026-06-22 00:00:00+02	2026-06-23 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.964754+02	2025-07-29 14:51:23.964754+02	t	6
6kp68cpj74pj4b9kc4rjeb9k6gom8b9o64r6cb9l6osm4e32cor30phl6k_20260628	Chiusura settimanale	\N	\N	2026-06-28 00:00:00+02	2026-06-29 00:00:00+02	sandro.stefanati@gmail.com	2020-09-30 18:09:28.001+02	2025-07-29 14:51:23.966452+02	2025-07-29 14:51:23.966452+02	t	6
3egems030fg9ehhatv4e1uvch3_20250701T100000Z	Pausa pranzo	\N	\N	2025-07-01 12:00:00+02	2025-07-01 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.967978+02	2025-07-29 14:51:23.967978+02	f	6
3egems030fg9ehhatv4e1uvch3_20250702T100000Z	Pausa pranzo	\N	\N	2025-07-02 12:00:00+02	2025-07-02 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.969416+02	2025-07-29 14:51:23.969416+02	f	6
3egems030fg9ehhatv4e1uvch3_20250708T100000Z	Pausa pranzo	\N	\N	2025-07-08 12:00:00+02	2025-07-08 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.970832+02	2025-07-29 14:51:23.970832+02	f	6
3egems030fg9ehhatv4e1uvch3_20250709T100000Z	Pausa pranzo	\N	\N	2025-07-09 12:00:00+02	2025-07-09 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.972211+02	2025-07-29 14:51:23.972211+02	f	6
3egems030fg9ehhatv4e1uvch3_20250715T100000Z	Pausa pranzo	\N	\N	2025-07-15 12:00:00+02	2025-07-15 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.973775+02	2025-07-29 14:51:23.973775+02	f	6
3egems030fg9ehhatv4e1uvch3_20250716T100000Z	Pausa pranzo	\N	\N	2025-07-16 12:00:00+02	2025-07-16 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.975143+02	2025-07-29 14:51:23.975143+02	f	6
3egems030fg9ehhatv4e1uvch3_20250722T100000Z	Pausa pranzo	\N	\N	2025-07-22 12:00:00+02	2025-07-22 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.976639+02	2025-07-29 14:51:23.976639+02	f	6
3egems030fg9ehhatv4e1uvch3_20250723T100000Z	Pausa pranzo	\N	\N	2025-07-23 12:00:00+02	2025-07-23 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.977988+02	2025-07-29 14:51:23.977988+02	f	6
3egems030fg9ehhatv4e1uvch3_20250729T100000Z	Pausa pranzo	\N	\N	2025-07-29 12:00:00+02	2025-07-29 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.979277+02	2025-07-29 14:51:23.979277+02	f	6
3egems030fg9ehhatv4e1uvch3_20250730T100000Z	Pausa pranzo	\N	\N	2025-07-30 12:00:00+02	2025-07-30 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.980529+02	2025-07-29 14:51:23.980529+02	f	6
3egems030fg9ehhatv4e1uvch3_20250805T100000Z	Pausa pranzo	\N	\N	2025-08-05 12:00:00+02	2025-08-05 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.981863+02	2025-07-29 14:51:23.981863+02	f	6
3egems030fg9ehhatv4e1uvch3_20250806T100000Z	Pausa pranzo	\N	\N	2025-08-06 12:00:00+02	2025-08-06 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.983134+02	2025-07-29 14:51:23.983134+02	f	6
3egems030fg9ehhatv4e1uvch3_20250812T100000Z	Pausa pranzo	\N	\N	2025-08-12 12:00:00+02	2025-08-12 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.984568+02	2025-07-29 14:51:23.984568+02	f	6
3egems030fg9ehhatv4e1uvch3_20250813T100000Z	Pausa pranzo	\N	\N	2025-08-13 12:00:00+02	2025-08-13 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.985802+02	2025-07-29 14:51:23.985802+02	f	6
3egems030fg9ehhatv4e1uvch3_20250819T100000Z	Pausa pranzo	\N	\N	2025-08-19 12:00:00+02	2025-08-19 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.987041+02	2025-07-29 14:51:23.987041+02	f	6
3egems030fg9ehhatv4e1uvch3_20250820T100000Z	Pausa pranzo	\N	\N	2025-08-20 12:00:00+02	2025-08-20 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.988691+02	2025-07-29 14:51:23.988691+02	f	6
3egems030fg9ehhatv4e1uvch3_20250826T100000Z	Pausa pranzo	\N	\N	2025-08-26 12:00:00+02	2025-08-26 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.990306+02	2025-07-29 14:51:23.990306+02	f	6
3egems030fg9ehhatv4e1uvch3_20250827T100000Z	Pausa pranzo	\N	\N	2025-08-27 12:00:00+02	2025-08-27 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.991693+02	2025-07-29 14:51:23.991693+02	f	6
3egems030fg9ehhatv4e1uvch3_20250902T100000Z	Pausa pranzo	\N	\N	2025-09-02 12:00:00+02	2025-09-02 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:23.993034+02	2025-07-29 14:51:23.993034+02	f	6
3egems030fg9ehhatv4e1uvch3_20250903T100000Z	Pausa pranzo	\N	\N	2025-09-03 12:00:00+02	2025-09-03 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.058717+02	2025-07-29 14:51:24.058717+02	f	6
3egems030fg9ehhatv4e1uvch3_20250909T100000Z	Pausa pranzo	\N	\N	2025-09-09 12:00:00+02	2025-09-09 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.060449+02	2025-07-29 14:51:24.060449+02	f	6
3egems030fg9ehhatv4e1uvch3_20250910T100000Z	Pausa pranzo	\N	\N	2025-09-10 12:00:00+02	2025-09-10 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.061896+02	2025-07-29 14:51:24.061896+02	f	6
3egems030fg9ehhatv4e1uvch3_20250916T100000Z	Pausa pranzo	\N	\N	2025-09-16 12:00:00+02	2025-09-16 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.063383+02	2025-07-29 14:51:24.063383+02	f	6
3egems030fg9ehhatv4e1uvch3_20250917T100000Z	Pausa pranzo	\N	\N	2025-09-17 12:00:00+02	2025-09-17 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.064852+02	2025-07-29 14:51:24.064852+02	f	6
3egems030fg9ehhatv4e1uvch3_20250923T100000Z	Pausa pranzo	\N	\N	2025-09-23 12:00:00+02	2025-09-23 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.066239+02	2025-07-29 14:51:24.066239+02	f	6
3egems030fg9ehhatv4e1uvch3_20250924T100000Z	Pausa pranzo	\N	\N	2025-09-24 12:00:00+02	2025-09-24 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.067599+02	2025-07-29 14:51:24.067599+02	f	6
3egems030fg9ehhatv4e1uvch3_20250930T100000Z	Pausa pranzo	\N	\N	2025-09-30 12:00:00+02	2025-09-30 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.068987+02	2025-07-29 14:51:24.068987+02	f	6
3egems030fg9ehhatv4e1uvch3_20251001T100000Z	Pausa pranzo	\N	\N	2025-10-01 12:00:00+02	2025-10-01 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.070349+02	2025-07-29 14:51:24.070349+02	f	6
3egems030fg9ehhatv4e1uvch3_20251007T100000Z	Pausa pranzo	\N	\N	2025-10-07 12:00:00+02	2025-10-07 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.071828+02	2025-07-29 14:51:24.071828+02	f	6
3egems030fg9ehhatv4e1uvch3_20251008T100000Z	Pausa pranzo	\N	\N	2025-10-08 12:00:00+02	2025-10-08 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.073588+02	2025-07-29 14:51:24.073588+02	f	6
3egems030fg9ehhatv4e1uvch3_20251014T100000Z	Pausa pranzo	\N	\N	2025-10-14 12:00:00+02	2025-10-14 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.075234+02	2025-07-29 14:51:24.075234+02	f	6
3egems030fg9ehhatv4e1uvch3_20251015T100000Z	Pausa pranzo	\N	\N	2025-10-15 12:00:00+02	2025-10-15 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.07653+02	2025-07-29 14:51:24.07653+02	f	6
3egems030fg9ehhatv4e1uvch3_20251021T100000Z	Pausa pranzo	\N	\N	2025-10-21 12:00:00+02	2025-10-21 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.077769+02	2025-07-29 14:51:24.077769+02	f	6
3egems030fg9ehhatv4e1uvch3_20251022T100000Z	Pausa pranzo	\N	\N	2025-10-22 12:00:00+02	2025-10-22 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.079663+02	2025-07-29 14:51:24.079663+02	f	6
3egems030fg9ehhatv4e1uvch3_20251028T110000Z	Pausa pranzo	\N	\N	2025-10-28 12:00:00+01	2025-10-28 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.080908+02	2025-07-29 14:51:24.080908+02	f	6
3egems030fg9ehhatv4e1uvch3_20251029T110000Z	Pausa pranzo	\N	\N	2025-10-29 12:00:00+01	2025-10-29 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.082092+02	2025-07-29 14:51:24.082092+02	f	6
3egems030fg9ehhatv4e1uvch3_20251104T110000Z	Pausa pranzo	\N	\N	2025-11-04 12:00:00+01	2025-11-04 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.083452+02	2025-07-29 14:51:24.083452+02	f	6
3egems030fg9ehhatv4e1uvch3_20251105T110000Z	Pausa pranzo	\N	\N	2025-11-05 12:00:00+01	2025-11-05 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.085081+02	2025-07-29 14:51:24.085081+02	f	6
3egems030fg9ehhatv4e1uvch3_20251111T110000Z	Pausa pranzo	\N	\N	2025-11-11 12:00:00+01	2025-11-11 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.08645+02	2025-07-29 14:51:24.08645+02	f	6
3egems030fg9ehhatv4e1uvch3_20251112T110000Z	Pausa pranzo	\N	\N	2025-11-12 12:00:00+01	2025-11-12 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.087969+02	2025-07-29 14:51:24.087969+02	f	6
3egems030fg9ehhatv4e1uvch3_20251118T110000Z	Pausa pranzo	\N	\N	2025-11-18 12:00:00+01	2025-11-18 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.089403+02	2025-07-29 14:51:24.089403+02	f	6
3egems030fg9ehhatv4e1uvch3_20251119T110000Z	Pausa pranzo	\N	\N	2025-11-19 12:00:00+01	2025-11-19 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.090778+02	2025-07-29 14:51:24.090778+02	f	6
3egems030fg9ehhatv4e1uvch3_20251125T110000Z	Pausa pranzo	\N	\N	2025-11-25 12:00:00+01	2025-11-25 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.092207+02	2025-07-29 14:51:24.092207+02	f	6
3egems030fg9ehhatv4e1uvch3_20251126T110000Z	Pausa pranzo	\N	\N	2025-11-26 12:00:00+01	2025-11-26 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.093448+02	2025-07-29 14:51:24.093448+02	f	6
3egems030fg9ehhatv4e1uvch3_20251202T110000Z	Pausa pranzo	\N	\N	2025-12-02 12:00:00+01	2025-12-02 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.094683+02	2025-07-29 14:51:24.094683+02	f	6
3egems030fg9ehhatv4e1uvch3_20251203T110000Z	Pausa pranzo	\N	\N	2025-12-03 12:00:00+01	2025-12-03 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.095904+02	2025-07-29 14:51:24.095904+02	f	6
3egems030fg9ehhatv4e1uvch3_20251209T110000Z	Pausa pranzo	\N	\N	2025-12-09 12:00:00+01	2025-12-09 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.097385+02	2025-07-29 14:51:24.097385+02	f	6
3egems030fg9ehhatv4e1uvch3_20251210T110000Z	Pausa pranzo	\N	\N	2025-12-10 12:00:00+01	2025-12-10 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.098639+02	2025-07-29 14:51:24.098639+02	f	6
3egems030fg9ehhatv4e1uvch3_20251216T110000Z	Pausa pranzo	\N	\N	2025-12-16 12:00:00+01	2025-12-16 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.099852+02	2025-07-29 14:51:24.099852+02	f	6
3egems030fg9ehhatv4e1uvch3_20251217T110000Z	Pausa pranzo	\N	\N	2025-12-17 12:00:00+01	2025-12-17 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.101015+02	2025-07-29 14:51:24.101015+02	f	6
3egems030fg9ehhatv4e1uvch3_20251223T110000Z	Pausa pranzo	\N	\N	2025-12-23 12:00:00+01	2025-12-23 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.102335+02	2025-07-29 14:51:24.102335+02	f	6
3egems030fg9ehhatv4e1uvch3_20251224T110000Z	Pausa pranzo	\N	\N	2025-12-24 12:00:00+01	2025-12-24 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.103901+02	2025-07-29 14:51:24.103901+02	f	6
3egems030fg9ehhatv4e1uvch3_20251230T110000Z	Pausa pranzo	\N	\N	2025-12-30 12:00:00+01	2025-12-30 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.105374+02	2025-07-29 14:51:24.105374+02	f	6
3egems030fg9ehhatv4e1uvch3_20251231T110000Z	Pausa pranzo	\N	\N	2025-12-31 12:00:00+01	2025-12-31 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.106695+02	2025-07-29 14:51:24.106695+02	f	6
3egems030fg9ehhatv4e1uvch3_20260106T110000Z	Pausa pranzo	\N	\N	2026-01-06 12:00:00+01	2026-01-06 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.108295+02	2025-07-29 14:51:24.108295+02	f	6
3egems030fg9ehhatv4e1uvch3_20260107T110000Z	Pausa pranzo	\N	\N	2026-01-07 12:00:00+01	2026-01-07 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.109564+02	2025-07-29 14:51:24.109564+02	f	6
3egems030fg9ehhatv4e1uvch3_20260113T110000Z	Pausa pranzo	\N	\N	2026-01-13 12:00:00+01	2026-01-13 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.110778+02	2025-07-29 14:51:24.110778+02	f	6
3egems030fg9ehhatv4e1uvch3_20260114T110000Z	Pausa pranzo	\N	\N	2026-01-14 12:00:00+01	2026-01-14 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.112147+02	2025-07-29 14:51:24.112147+02	f	6
3egems030fg9ehhatv4e1uvch3_20260120T110000Z	Pausa pranzo	\N	\N	2026-01-20 12:00:00+01	2026-01-20 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.113355+02	2025-07-29 14:51:24.113355+02	f	6
3egems030fg9ehhatv4e1uvch3_20260121T110000Z	Pausa pranzo	\N	\N	2026-01-21 12:00:00+01	2026-01-21 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.114544+02	2025-07-29 14:51:24.114544+02	f	6
3egems030fg9ehhatv4e1uvch3_20260127T110000Z	Pausa pranzo	\N	\N	2026-01-27 12:00:00+01	2026-01-27 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.116406+02	2025-07-29 14:51:24.116406+02	f	6
3egems030fg9ehhatv4e1uvch3_20260128T110000Z	Pausa pranzo	\N	\N	2026-01-28 12:00:00+01	2026-01-28 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.117634+02	2025-07-29 14:51:24.117634+02	f	6
3egems030fg9ehhatv4e1uvch3_20260203T110000Z	Pausa pranzo	\N	\N	2026-02-03 12:00:00+01	2026-02-03 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.119078+02	2025-07-29 14:51:24.119078+02	f	6
3egems030fg9ehhatv4e1uvch3_20260204T110000Z	Pausa pranzo	\N	\N	2026-02-04 12:00:00+01	2026-02-04 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.121084+02	2025-07-29 14:51:24.121084+02	f	6
3egems030fg9ehhatv4e1uvch3_20260210T110000Z	Pausa pranzo	\N	\N	2026-02-10 12:00:00+01	2026-02-10 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.122365+02	2025-07-29 14:51:24.122365+02	f	6
3egems030fg9ehhatv4e1uvch3_20260211T110000Z	Pausa pranzo	\N	\N	2026-02-11 12:00:00+01	2026-02-11 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.123648+02	2025-07-29 14:51:24.123648+02	f	6
3egems030fg9ehhatv4e1uvch3_20260217T110000Z	Pausa pranzo	\N	\N	2026-02-17 12:00:00+01	2026-02-17 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.125174+02	2025-07-29 14:51:24.125174+02	f	6
3egems030fg9ehhatv4e1uvch3_20260218T110000Z	Pausa pranzo	\N	\N	2026-02-18 12:00:00+01	2026-02-18 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.127328+02	2025-07-29 14:51:24.127328+02	f	6
3egems030fg9ehhatv4e1uvch3_20260224T110000Z	Pausa pranzo	\N	\N	2026-02-24 12:00:00+01	2026-02-24 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.128514+02	2025-07-29 14:51:24.128514+02	f	6
3egems030fg9ehhatv4e1uvch3_20260225T110000Z	Pausa pranzo	\N	\N	2026-02-25 12:00:00+01	2026-02-25 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.129693+02	2025-07-29 14:51:24.129693+02	f	6
3egems030fg9ehhatv4e1uvch3_20260303T110000Z	Pausa pranzo	\N	\N	2026-03-03 12:00:00+01	2026-03-03 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.130908+02	2025-07-29 14:51:24.130908+02	f	6
3egems030fg9ehhatv4e1uvch3_20260304T110000Z	Pausa pranzo	\N	\N	2026-03-04 12:00:00+01	2026-03-04 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.132108+02	2025-07-29 14:51:24.132108+02	f	6
3egems030fg9ehhatv4e1uvch3_20260310T110000Z	Pausa pranzo	\N	\N	2026-03-10 12:00:00+01	2026-03-10 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.133282+02	2025-07-29 14:51:24.133282+02	f	6
3egems030fg9ehhatv4e1uvch3_20260311T110000Z	Pausa pranzo	\N	\N	2026-03-11 12:00:00+01	2026-03-11 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.134456+02	2025-07-29 14:51:24.134456+02	f	6
3egems030fg9ehhatv4e1uvch3_20260317T110000Z	Pausa pranzo	\N	\N	2026-03-17 12:00:00+01	2026-03-17 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.135806+02	2025-07-29 14:51:24.135806+02	f	6
3egems030fg9ehhatv4e1uvch3_20260318T110000Z	Pausa pranzo	\N	\N	2026-03-18 12:00:00+01	2026-03-18 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.137286+02	2025-07-29 14:51:24.137286+02	f	6
3egems030fg9ehhatv4e1uvch3_20260324T110000Z	Pausa pranzo	\N	\N	2026-03-24 12:00:00+01	2026-03-24 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.138501+02	2025-07-29 14:51:24.138501+02	f	6
3egems030fg9ehhatv4e1uvch3_20260325T110000Z	Pausa pranzo	\N	\N	2026-03-25 12:00:00+01	2026-03-25 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.139687+02	2025-07-29 14:51:24.139687+02	f	6
3egems030fg9ehhatv4e1uvch3_20260331T100000Z	Pausa pranzo	\N	\N	2026-03-31 12:00:00+02	2026-03-31 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.141+02	2025-07-29 14:51:24.141+02	f	6
3egems030fg9ehhatv4e1uvch3_20260401T100000Z	Pausa pranzo	\N	\N	2026-04-01 12:00:00+02	2026-04-01 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.14235+02	2025-07-29 14:51:24.14235+02	f	6
3egems030fg9ehhatv4e1uvch3_20260407T100000Z	Pausa pranzo	\N	\N	2026-04-07 12:00:00+02	2026-04-07 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.143676+02	2025-07-29 14:51:24.143676+02	f	6
3egems030fg9ehhatv4e1uvch3_20260408T100000Z	Pausa pranzo	\N	\N	2026-04-08 12:00:00+02	2026-04-08 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.144932+02	2025-07-29 14:51:24.144932+02	f	6
3egems030fg9ehhatv4e1uvch3_20260414T100000Z	Pausa pranzo	\N	\N	2026-04-14 12:00:00+02	2026-04-14 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.146651+02	2025-07-29 14:51:24.146651+02	f	6
3egems030fg9ehhatv4e1uvch3_20260415T100000Z	Pausa pranzo	\N	\N	2026-04-15 12:00:00+02	2026-04-15 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.147909+02	2025-07-29 14:51:24.147909+02	f	6
3egems030fg9ehhatv4e1uvch3_20260421T100000Z	Pausa pranzo	\N	\N	2026-04-21 12:00:00+02	2026-04-21 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.149118+02	2025-07-29 14:51:24.149118+02	f	6
3egems030fg9ehhatv4e1uvch3_20260422T100000Z	Pausa pranzo	\N	\N	2026-04-22 12:00:00+02	2026-04-22 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.150279+02	2025-07-29 14:51:24.150279+02	f	6
3egems030fg9ehhatv4e1uvch3_20260428T100000Z	Pausa pranzo	\N	\N	2026-04-28 12:00:00+02	2026-04-28 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.151581+02	2025-07-29 14:51:24.151581+02	f	6
3egems030fg9ehhatv4e1uvch3_20260429T100000Z	Pausa pranzo	\N	\N	2026-04-29 12:00:00+02	2026-04-29 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.152749+02	2025-07-29 14:51:24.152749+02	f	6
3egems030fg9ehhatv4e1uvch3_20260505T100000Z	Pausa pranzo	\N	\N	2026-05-05 12:00:00+02	2026-05-05 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.154209+02	2025-07-29 14:51:24.154209+02	f	6
3egems030fg9ehhatv4e1uvch3_20260506T100000Z	Pausa pranzo	\N	\N	2026-05-06 12:00:00+02	2026-05-06 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.155388+02	2025-07-29 14:51:24.155388+02	f	6
3egems030fg9ehhatv4e1uvch3_20260512T100000Z	Pausa pranzo	\N	\N	2026-05-12 12:00:00+02	2026-05-12 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.156605+02	2025-07-29 14:51:24.156605+02	f	6
3egems030fg9ehhatv4e1uvch3_20260513T100000Z	Pausa pranzo	\N	\N	2026-05-13 12:00:00+02	2026-05-13 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.157909+02	2025-07-29 14:51:24.157909+02	f	6
3egems030fg9ehhatv4e1uvch3_20260519T100000Z	Pausa pranzo	\N	\N	2026-05-19 12:00:00+02	2026-05-19 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.159252+02	2025-07-29 14:51:24.159252+02	f	6
3egems030fg9ehhatv4e1uvch3_20260520T100000Z	Pausa pranzo	\N	\N	2026-05-20 12:00:00+02	2026-05-20 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.160459+02	2025-07-29 14:51:24.160459+02	f	6
3egems030fg9ehhatv4e1uvch3_20260526T100000Z	Pausa pranzo	\N	\N	2026-05-26 12:00:00+02	2026-05-26 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.162294+02	2025-07-29 14:51:24.162294+02	f	6
3egems030fg9ehhatv4e1uvch3_20260527T100000Z	Pausa pranzo	\N	\N	2026-05-27 12:00:00+02	2026-05-27 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.163694+02	2025-07-29 14:51:24.163694+02	f	6
3egems030fg9ehhatv4e1uvch3_20260602T100000Z	Pausa pranzo	\N	\N	2026-06-02 12:00:00+02	2026-06-02 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.165205+02	2025-07-29 14:51:24.165205+02	f	6
3egems030fg9ehhatv4e1uvch3_20260603T100000Z	Pausa pranzo	\N	\N	2026-06-03 12:00:00+02	2026-06-03 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.166905+02	2025-07-29 14:51:24.166905+02	f	6
3egems030fg9ehhatv4e1uvch3_20260609T100000Z	Pausa pranzo	\N	\N	2026-06-09 12:00:00+02	2026-06-09 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.168339+02	2025-07-29 14:51:24.168339+02	f	6
3egems030fg9ehhatv4e1uvch3_20260610T100000Z	Pausa pranzo	\N	\N	2026-06-10 12:00:00+02	2026-06-10 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.169606+02	2025-07-29 14:51:24.169606+02	f	6
3egems030fg9ehhatv4e1uvch3_20260616T100000Z	Pausa pranzo	\N	\N	2026-06-16 12:00:00+02	2026-06-16 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.171272+02	2025-07-29 14:51:24.171272+02	f	6
3egems030fg9ehhatv4e1uvch3_20260617T100000Z	Pausa pranzo	\N	\N	2026-06-17 12:00:00+02	2026-06-17 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.172487+02	2025-07-29 14:51:24.172487+02	f	6
3egems030fg9ehhatv4e1uvch3_20260623T100000Z	Pausa pranzo	\N	\N	2026-06-23 12:00:00+02	2026-06-23 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.174022+02	2025-07-29 14:51:24.174022+02	f	6
3egems030fg9ehhatv4e1uvch3_20260624T100000Z	Pausa pranzo	\N	\N	2026-06-24 12:00:00+02	2026-06-24 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.175485+02	2025-07-29 14:51:24.175485+02	f	6
3egems030fg9ehhatv4e1uvch3_20260630T100000Z	Pausa pranzo	\N	\N	2026-06-30 12:00:00+02	2026-06-30 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.176712+02	2025-07-29 14:51:24.176712+02	f	6
3egems030fg9ehhatv4e1uvch3_20260701T100000Z	Pausa pranzo	\N	\N	2026-07-01 12:00:00+02	2026-07-01 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.177939+02	2025-07-29 14:51:24.177939+02	f	6
3egems030fg9ehhatv4e1uvch3_20260707T100000Z	Pausa pranzo	\N	\N	2026-07-07 12:00:00+02	2026-07-07 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.179141+02	2025-07-29 14:51:24.179141+02	f	6
3egems030fg9ehhatv4e1uvch3_20260708T100000Z	Pausa pranzo	\N	\N	2026-07-08 12:00:00+02	2026-07-08 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.180347+02	2025-07-29 14:51:24.180347+02	f	6
3egems030fg9ehhatv4e1uvch3_20260714T100000Z	Pausa pranzo	\N	\N	2026-07-14 12:00:00+02	2026-07-14 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.181642+02	2025-07-29 14:51:24.181642+02	f	6
3egems030fg9ehhatv4e1uvch3_20260715T100000Z	Pausa pranzo	\N	\N	2026-07-15 12:00:00+02	2026-07-15 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.183123+02	2025-07-29 14:51:24.183123+02	f	6
3egems030fg9ehhatv4e1uvch3_20260721T100000Z	Pausa pranzo	\N	\N	2026-07-21 12:00:00+02	2026-07-21 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.184324+02	2025-07-29 14:51:24.184324+02	f	6
3egems030fg9ehhatv4e1uvch3_20260722T100000Z	Pausa pranzo	\N	\N	2026-07-22 12:00:00+02	2026-07-22 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.185491+02	2025-07-29 14:51:24.185491+02	f	6
3egems030fg9ehhatv4e1uvch3_20260728T100000Z	Pausa pranzo	\N	\N	2026-07-28 12:00:00+02	2026-07-28 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.186734+02	2025-07-29 14:51:24.186734+02	f	6
3egems030fg9ehhatv4e1uvch3_20260729T100000Z	Pausa pranzo	\N	\N	2026-07-29 12:00:00+02	2026-07-29 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.187945+02	2025-07-29 14:51:24.187945+02	f	6
3egems030fg9ehhatv4e1uvch3_20260804T100000Z	Pausa pranzo	\N	\N	2026-08-04 12:00:00+02	2026-08-04 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.189155+02	2025-07-29 14:51:24.189155+02	f	6
3egems030fg9ehhatv4e1uvch3_20260805T100000Z	Pausa pranzo	\N	\N	2026-08-05 12:00:00+02	2026-08-05 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.190596+02	2025-07-29 14:51:24.190596+02	f	6
3egems030fg9ehhatv4e1uvch3_20260811T100000Z	Pausa pranzo	\N	\N	2026-08-11 12:00:00+02	2026-08-11 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.192069+02	2025-07-29 14:51:24.192069+02	f	6
3egems030fg9ehhatv4e1uvch3_20260812T100000Z	Pausa pranzo	\N	\N	2026-08-12 12:00:00+02	2026-08-12 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.193307+02	2025-07-29 14:51:24.193307+02	f	6
3egems030fg9ehhatv4e1uvch3_20260818T100000Z	Pausa pranzo	\N	\N	2026-08-18 12:00:00+02	2026-08-18 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.194672+02	2025-07-29 14:51:24.194672+02	f	6
3egems030fg9ehhatv4e1uvch3_20260819T100000Z	Pausa pranzo	\N	\N	2026-08-19 12:00:00+02	2026-08-19 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.196263+02	2025-07-29 14:51:24.196263+02	f	6
3egems030fg9ehhatv4e1uvch3_20260825T100000Z	Pausa pranzo	\N	\N	2026-08-25 12:00:00+02	2026-08-25 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.197669+02	2025-07-29 14:51:24.197669+02	f	6
3egems030fg9ehhatv4e1uvch3_20260826T100000Z	Pausa pranzo	\N	\N	2026-08-26 12:00:00+02	2026-08-26 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.198896+02	2025-07-29 14:51:24.198896+02	f	6
3egems030fg9ehhatv4e1uvch3_20260901T100000Z	Pausa pranzo	\N	\N	2026-09-01 12:00:00+02	2026-09-01 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.200148+02	2025-07-29 14:51:24.200148+02	f	6
3egems030fg9ehhatv4e1uvch3_20260902T100000Z	Pausa pranzo	\N	\N	2026-09-02 12:00:00+02	2026-09-02 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.2016+02	2025-07-29 14:51:24.2016+02	f	6
3egems030fg9ehhatv4e1uvch3_20260908T100000Z	Pausa pranzo	\N	\N	2026-09-08 12:00:00+02	2026-09-08 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.202849+02	2025-07-29 14:51:24.202849+02	f	6
3egems030fg9ehhatv4e1uvch3_20260909T100000Z	Pausa pranzo	\N	\N	2026-09-09 12:00:00+02	2026-09-09 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.204032+02	2025-07-29 14:51:24.204032+02	f	6
3egems030fg9ehhatv4e1uvch3_20260915T100000Z	Pausa pranzo	\N	\N	2026-09-15 12:00:00+02	2026-09-15 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.205247+02	2025-07-29 14:51:24.205247+02	f	6
3egems030fg9ehhatv4e1uvch3_20260916T100000Z	Pausa pranzo	\N	\N	2026-09-16 12:00:00+02	2026-09-16 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.206438+02	2025-07-29 14:51:24.206438+02	f	6
3egems030fg9ehhatv4e1uvch3_20260922T100000Z	Pausa pranzo	\N	\N	2026-09-22 12:00:00+02	2026-09-22 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.207918+02	2025-07-29 14:51:24.207918+02	f	6
3egems030fg9ehhatv4e1uvch3_20260923T100000Z	Pausa pranzo	\N	\N	2026-09-23 12:00:00+02	2026-09-23 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.209263+02	2025-07-29 14:51:24.209263+02	f	6
3egems030fg9ehhatv4e1uvch3_20260929T100000Z	Pausa pranzo	\N	\N	2026-09-29 12:00:00+02	2026-09-29 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.210524+02	2025-07-29 14:51:24.210524+02	f	6
3egems030fg9ehhatv4e1uvch3_20260930T100000Z	Pausa pranzo	\N	\N	2026-09-30 12:00:00+02	2026-09-30 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.211713+02	2025-07-29 14:51:24.211713+02	f	6
3egems030fg9ehhatv4e1uvch3_20261006T100000Z	Pausa pranzo	\N	\N	2026-10-06 12:00:00+02	2026-10-06 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.213015+02	2025-07-29 14:51:24.213015+02	f	6
3egems030fg9ehhatv4e1uvch3_20261007T100000Z	Pausa pranzo	\N	\N	2026-10-07 12:00:00+02	2026-10-07 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.214224+02	2025-07-29 14:51:24.214224+02	f	6
3egems030fg9ehhatv4e1uvch3_20261013T100000Z	Pausa pranzo	\N	\N	2026-10-13 12:00:00+02	2026-10-13 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.21544+02	2025-07-29 14:51:24.21544+02	f	6
3egems030fg9ehhatv4e1uvch3_20261014T100000Z	Pausa pranzo	\N	\N	2026-10-14 12:00:00+02	2026-10-14 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.216611+02	2025-07-29 14:51:24.216611+02	f	6
3egems030fg9ehhatv4e1uvch3_20261020T100000Z	Pausa pranzo	\N	\N	2026-10-20 12:00:00+02	2026-10-20 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.217762+02	2025-07-29 14:51:24.217762+02	f	6
3egems030fg9ehhatv4e1uvch3_20261021T100000Z	Pausa pranzo	\N	\N	2026-10-21 12:00:00+02	2026-10-21 14:45:00+02	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.219067+02	2025-07-29 14:51:24.219067+02	f	6
3egems030fg9ehhatv4e1uvch3_20261027T110000Z	Pausa pranzo	\N	\N	2026-10-27 12:00:00+01	2026-10-27 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.220491+02	2025-07-29 14:51:24.220491+02	f	6
3egems030fg9ehhatv4e1uvch3_20261028T110000Z	Pausa pranzo	\N	\N	2026-10-28 12:00:00+01	2026-10-28 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.221816+02	2025-07-29 14:51:24.221816+02	f	6
3egems030fg9ehhatv4e1uvch3_20261103T110000Z	Pausa pranzo	\N	\N	2026-11-03 12:00:00+01	2026-11-03 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.223132+02	2025-07-29 14:51:24.223132+02	f	6
3egems030fg9ehhatv4e1uvch3_20261104T110000Z	Pausa pranzo	\N	\N	2026-11-04 12:00:00+01	2026-11-04 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.224666+02	2025-07-29 14:51:24.224666+02	f	6
3egems030fg9ehhatv4e1uvch3_20261110T110000Z	Pausa pranzo	\N	\N	2026-11-10 12:00:00+01	2026-11-10 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.226168+02	2025-07-29 14:51:24.226168+02	f	6
3egems030fg9ehhatv4e1uvch3_20261111T110000Z	Pausa pranzo	\N	\N	2026-11-11 12:00:00+01	2026-11-11 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.227479+02	2025-07-29 14:51:24.227479+02	f	6
3egems030fg9ehhatv4e1uvch3_20261117T110000Z	Pausa pranzo	\N	\N	2026-11-17 12:00:00+01	2026-11-17 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.228801+02	2025-07-29 14:51:24.228801+02	f	6
3egems030fg9ehhatv4e1uvch3_20261118T110000Z	Pausa pranzo	\N	\N	2026-11-18 12:00:00+01	2026-11-18 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.230802+02	2025-07-29 14:51:24.230802+02	f	6
3egems030fg9ehhatv4e1uvch3_20261124T110000Z	Pausa pranzo	\N	\N	2026-11-24 12:00:00+01	2026-11-24 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.232374+02	2025-07-29 14:51:24.232374+02	f	6
3egems030fg9ehhatv4e1uvch3_20261125T110000Z	Pausa pranzo	\N	\N	2026-11-25 12:00:00+01	2026-11-25 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.233879+02	2025-07-29 14:51:24.233879+02	f	6
3egems030fg9ehhatv4e1uvch3_20261201T110000Z	Pausa pranzo	\N	\N	2026-12-01 12:00:00+01	2026-12-01 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.235138+02	2025-07-29 14:51:24.235138+02	f	6
3egems030fg9ehhatv4e1uvch3_20261202T110000Z	Pausa pranzo	\N	\N	2026-12-02 12:00:00+01	2026-12-02 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.236394+02	2025-07-29 14:51:24.236394+02	f	6
3egems030fg9ehhatv4e1uvch3_20261208T110000Z	Pausa pranzo	\N	\N	2026-12-08 12:00:00+01	2026-12-08 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.238159+02	2025-07-29 14:51:24.238159+02	f	6
3egems030fg9ehhatv4e1uvch3_20261209T110000Z	Pausa pranzo	\N	\N	2026-12-09 12:00:00+01	2026-12-09 14:45:00+01	sandro.stefanati@gmail.com	2024-12-19 10:36:18.686+01	2025-07-29 14:51:24.23969+02	2025-07-29 14:51:24.23969+02	f	6
5j6io7ot17jhcnb3unnpmqh0nm	Sonia Fontana tn	\N	\N	2025-07-05 08:30:00+02	2025-07-05 10:00:00+02	qualityhairbolzano@gmail.com	2025-06-07 10:04:05.625+02	2025-07-29 14:51:24.241679+02	2025-07-29 14:51:24.241679+02	f	\N
5ml0o37n81dsnc8lo0an7jscg2	Vito tg	\N	\N	2025-07-05 12:30:00+02	2025-07-05 13:00:00+02	qualityhairbolzano@gmail.com	2025-06-07 13:35:54.587+02	2025-07-29 14:51:24.243095+02	2025-07-29 14:51:24.243095+02	f	\N
0gurogir85g4ocg4jujfe87qmh	Patty P	\N	\N	2025-07-05 12:00:00+02	2025-07-05 12:30:00+02	qualityhairbolzano@gmail.com	2025-06-07 13:36:01.606+02	2025-07-29 14:51:24.24464+02	2025-07-29 14:51:24.24464+02	f	\N
5bbaq807k6fpt1f7nc1gmfh965	Luca Ianeselli tr tg barba	\N	\N	2025-07-03 12:30:00+02	2025-07-03 13:30:00+02	qualityhairbolzano@gmail.com	2025-06-12 22:24:14.135+02	2025-07-29 14:51:24.246491+02	2025-07-29 14:51:24.246491+02	f	\N
521ap9e7ndcca2274i2cvp7c83	Lorenzo Gattolin tg barba	\N	\N	2025-07-05 10:00:00+02	2025-07-05 11:00:00+02	qualityhairbolzano@gmail.com	2025-06-16 12:12:08.184+02	2025-07-29 14:51:24.24805+02	2025-07-29 14:51:24.24805+02	f	\N
6kqb3ih9sptmg9bbgfagr09q1v	Mara Demarchi tn tg	\N	\N	2025-07-16 15:00:00+02	2025-07-16 16:30:00+02	qualityhairbolzano@gmail.com	2025-06-18 16:29:17.504+02	2025-07-29 14:51:24.249378+02	2025-07-29 14:51:24.249378+02	f	\N
7tfjg20iihkk08qglvftkf5kpl	Max Roubal tg	\N	\N	2025-07-12 08:30:00+02	2025-07-12 09:00:00+02	qualityhairbolzano@gmail.com	2025-06-23 15:15:42.327+02	2025-07-29 14:51:24.250653+02	2025-07-29 14:51:24.250653+02	f	\N
2gqi7hrq6vqvv2a2vcofkiiuk9	Lombardozzi tg	\N	\N	2025-09-16 11:00:00+02	2025-09-16 11:30:00+02	qualityhairbolzano@gmail.com	2025-06-24 11:05:58.318+02	2025-07-29 14:51:24.254254+02	2025-07-29 14:51:24.254254+02	f	\N
7ot0ir6lm64d34v15dnd02hnt4	 Graziella Raffaelli (mamma Sara) tn+tg	\N	\N	2025-07-01 15:00:00+02	2025-07-01 17:00:00+02	sandro.stefanati@gmail.com	2025-06-25 11:39:20.665+02	2025-07-29 14:51:24.255462+02	2025-07-29 14:51:24.255462+02	f	\N
7k6bpa1ujkom7qogp3hmpjedek	Luca Samiolo tg	\N	\N	2025-07-15 16:00:00+02	2025-07-15 16:30:00+02	qualityhairbolzano@gmail.com	2025-06-25 16:21:11.14+02	2025-07-29 14:51:24.256652+02	2025-07-29 14:51:24.256652+02	f	\N
52nrvsc1669cbsivr3f9m5jrgq	Luca Samiolo tg	\N	\N	2025-08-27 16:00:00+02	2025-08-27 16:30:00+02	qualityhairbolzano@gmail.com	2025-06-25 16:22:09.287+02	2025-07-29 14:51:24.2581+02	2025-07-29 14:51:24.2581+02	f	\N
6lijioj570pmabb2c4r3cb9kcpi3cb9o6co66b9l64r3gcr36or38c34ck	Mauro Stoffella tg	\N	\N	2025-07-01 11:30:00+02	2025-07-01 12:00:00+02	qualityhairbolzano@gmail.com	2025-06-26 07:59:46.7+02	2025-07-29 14:51:24.260795+02	2025-07-29 14:51:24.260795+02	f	\N
5d0k2qvndhlv41s7482evlqfa7	barbara vio tn	\N	\N	2025-07-01 16:30:00+02	2025-07-01 18:30:00+02	qualityhairbolzano@gmail.com	2025-06-26 08:59:02.985+02	2025-07-29 14:51:24.262122+02	2025-07-29 14:51:24.262122+02	f	7
18d3pmkov71co72dbdl6j5t1qq	Eugenio Pennini tg	\N	\N	2025-07-19 09:00:00+02	2025-07-19 09:30:00+02	qualityhairbolzano@gmail.com	2025-06-26 13:27:37.982+02	2025-07-29 14:51:24.263324+02	2025-07-29 14:51:24.263324+02	f	\N
10gkqccp9oin3c0knvgb7ekbr3	ennio ambrosi	\N	\N	2025-07-05 11:00:00+02	2025-07-05 11:30:00+02	qualityhairbolzano@gmail.com	2025-06-28 11:21:52.198+02	2025-07-29 14:51:24.264492+02	2025-07-29 14:51:24.264492+02	f	7
7b5thfh51i2uvmco7h9t791k3k	Michela Albanese tn	\N	\N	2025-07-19 09:30:00+02	2025-07-19 11:00:00+02	qualityhairbolzano@gmail.com	2025-06-28 14:43:03.492+02	2025-07-29 14:51:24.265687+02	2025-07-29 14:51:24.265687+02	f	\N
3uead997ahbuf9cgbdh9iudrhs	maccagnan claudio tg	\N	\N	2025-07-01 10:00:00+02	2025-07-01 10:30:00+02	tlpebaby2000@gmail.com	2025-07-01 08:58:05.303+02	2025-07-29 14:51:24.268091+02	2025-07-29 14:51:24.268091+02	f	7
4flmcl18r8ds838c5glmldl637	Paolo Refatti tg	\N	\N	2025-07-02 11:00:00+02	2025-07-02 11:30:00+02	sandro.stefanati@gmail.com	2025-07-01 09:27:49.393+02	2025-07-29 14:51:24.26966+02	2025-07-29 14:51:24.26966+02	f	\N
4c2fqm1jfqkkiq9reag6ju5svb	Hugo Stoffella tg	\N	\N	2025-07-04 12:30:00+02	2025-07-04 13:00:00+02	sandro.stefanati@gmail.com	2025-07-01 09:54:34.964+02	2025-07-29 14:51:24.271038+02	2025-07-29 14:51:24.271038+02	f	\N
64qmcor360om8b9g6gq34b9k74p3ibb2cpgjibb5c4r6cdhgccpjcd1h60	Miki Piccoli tg	\N	\N	2025-07-02 17:15:00+02	2025-07-02 17:45:00+02	qualityhairbolzano@gmail.com	2025-07-01 11:17:23.715+02	2025-07-29 14:51:24.272729+02	2025-07-29 14:51:24.272729+02	f	\N
5b51vpmhnmcopun94b9j94je1a	Alberto Boffo tg	\N	\N	2025-07-02 10:00:00+02	2025-07-02 10:30:00+02	sandro.stefanati@gmail.com	2025-07-01 11:20:22.722+02	2025-07-29 14:51:24.274288+02	2025-07-29 14:51:24.274288+02	f	\N
4fga2or37t5vhli3hm53taeheu	Toni Amort tg	\N	\N	2025-07-05 15:30:00+02	2025-07-05 16:00:00+02	sandro.stefanati@gmail.com	2025-07-01 15:28:56.88+02	2025-07-29 14:51:24.276024+02	2025-07-29 14:51:24.276024+02	f	\N
10d2o3hu1hc8qthtaj75shntpd	roland erardi tg	\N	\N	2025-07-02 15:00:00+02	2025-07-02 15:30:00+02	qualityhairbolzano@gmail.com	2025-07-02 11:34:06.455+02	2025-07-29 14:51:24.27747+02	2025-07-29 14:51:24.27747+02	f	7
cgq62cj1c8r3cb9pc5hmab9k60oj0b9pckom2b9i64s36dr46cr3acpo6k	Sandro ferie	\N	\N	2025-09-02 00:00:00+02	2025-09-07 00:00:00+02	qualityhairbolzano@gmail.com	2025-07-02 16:55:50.405+02	2025-07-29 14:51:24.278867+02	2025-07-29 14:51:24.278867+02	t	\N
12i0qnnvh15psbamf867o7nvus	azzera cassa	\N	\N	2025-08-30 00:00:00+02	2025-08-31 00:00:00+02	sandro.stefanati@gmail.com	2025-07-02 16:56:09.782+02	2025-07-29 14:51:24.280256+02	2025-07-29 14:51:24.280256+02	t	6
0fil8cmr67d1aaq1nu2tm2ucr8	Simone Gerometta tg	\N	\N	2025-07-09 15:00:00+02	2025-07-09 15:30:00+02	sandro.stefanati@gmail.com	2025-07-02 17:39:50.318+02	2025-07-29 14:51:24.281736+02	2025-07-29 14:51:24.281736+02	f	\N
7gpro08cep6svb2sgr4qoekto4	Enzo Rubbo tg	\N	\N	2025-07-03 11:00:00+02	2025-07-03 11:30:00+02	sandro.stefanati@gmail.com	2025-07-03 09:56:50.332+02	2025-07-29 14:51:24.283199+02	2025-07-29 14:51:24.283199+02	f	\N
2fsbdem1ej2h7bi8t882b4s5nd	Loredana Gobbetti tg	\N	\N	2025-07-03 08:30:00+02	2025-07-03 09:00:00+02	qualityhairbolzano@gmail.com	2025-07-03 10:23:30.115+02	2025-07-29 14:51:24.284594+02	2025-07-29 14:51:24.284594+02	f	\N
60hsvdg8plfqi3lokes0hod0p2	alex ferrari tg 	\N	\N	2025-07-03 13:00:00+02	2025-07-03 13:30:00+02	qualityhairbolzano@gmail.com	2025-07-03 13:31:23.369+02	2025-07-29 14:51:24.286199+02	2025-07-29 14:51:24.286199+02	f	7
2p6uf5hohtv8n4b0b6aaevh8fv	Claudia Zanettini tn	\N	\N	2025-08-12 15:00:00+02	2025-08-12 17:00:00+02	qualityhairbolzano@gmail.com	2025-07-03 15:32:12.227+02	2025-07-29 14:51:24.287434+02	2025-07-29 14:51:24.287434+02	f	\N
2pacvm13buodno71oeln7m1fnh	claudia zanettini tn	\N	\N	2025-07-03 14:00:00+02	2025-07-03 15:30:00+02	tlpebaby2000@gmail.com	2025-07-03 15:32:22.037+02	2025-07-29 14:51:24.2887+02	2025-07-29 14:51:24.2887+02	f	\N
0u4qa2j6u36dqi2ec2uve0srv8	Gabriel Gottardi perm tg	\N	\N	2025-07-03 16:45:00+02	2025-07-03 18:30:00+02	qualityhairbolzano@gmail.com	2025-07-03 18:25:51.793+02	2025-07-29 14:51:24.289871+02	2025-07-29 14:51:24.289871+02	f	\N
4q1crhusofep3ct08ai4u979c6	Luca Ianeselli barba	\N	\N	2025-07-24 12:30:00+02	2025-07-24 13:00:00+02	qualityhairbolzano@gmail.com	2025-07-03 18:56:43.822+02	2025-07-29 14:51:24.29127+02	2025-07-29 14:51:24.29127+02	f	\N
68omce1m70o32bb374p32b9k69hjcbb16csjib9n6orj0c9oc5h3acr3ck	Michela Musmeci tg + zia tg	\N	\N	2025-07-04 13:15:00+02	2025-07-04 14:15:00+02	qualityhairbolzano@gmail.com	2025-07-04 14:05:12.912+02	2025-07-29 14:51:24.2927+02	2025-07-29 14:51:24.2927+02	f	\N
1f62a7ml9qhniq12vi5a31rbrd	Michela Musmeci tg	\N	\N	2025-08-05 14:45:00+02	2025-08-05 15:15:00+02	qualityhairbolzano@gmail.com	2025-07-04 14:05:46.322+02	2025-07-29 14:51:24.293905+02	2025-07-29 14:51:24.293905+02	f	\N
64pj0dhh6cq3ab9o6gr66b9k68oj6bb268s62b9o74p62cb171hm4c1n68	Stefano Pesce tg barba	\N	\N	2025-07-08 10:30:00+02	2025-07-08 11:30:00+02	qualityhairbolzano@gmail.com	2025-07-04 16:39:09.436+02	2025-07-29 14:51:24.295055+02	2025-07-29 14:51:24.295055+02	f	\N
3ni8832005glt1vq993mmanp5t	Hubert Giardinetto Tg	\N	\N	2025-07-09 16:00:00+02	2025-07-09 16:30:00+02	qualityhairbolzano@gmail.com	2025-07-04 17:56:23.578+02	2025-07-29 14:51:24.296198+02	2025-07-29 14:51:24.296198+02	f	\N
7b40r3mqobtk8lnpnfhctr81s3	Marghe Kaczor tg	\N	\N	2025-07-05 14:00:00+02	2025-07-05 14:30:00+02	sandro.stefanati@gmail.com	2025-07-04 17:59:30.647+02	2025-07-29 14:51:24.297312+02	2025-07-29 14:51:24.297312+02	f	\N
79notcv3tmikv6vguh2ilcs385	Marco Lombardozzi tg	\N	\N	2025-08-05 11:00:00+02	2025-08-05 11:30:00+02	qualityhairbolzano@gmail.com	2025-08-05 06:56:55.663+02	2025-07-29 14:51:24.251861+02	2025-08-05 08:28:19.480251+02	f	\N
2f6acie1i78178roskc94ri9g6	Marco Lombardozzi tg	\N	\N	2025-08-26 11:00:00+02	2025-08-26 11:30:00+02	qualityhairbolzano@gmail.com	2025-08-05 07:47:40.469+02	2025-07-29 14:51:24.253074+02	2025-08-05 08:28:19.482669+02	f	\N
1ib67j61hg1afa9fi4c18hgmmc	Luca Samiolo tg	\N	\N	2025-08-05 16:15:00+02	2025-08-05 16:45:00+02	qualityhairbolzano@gmail.com	2025-08-05 16:19:25.61+02	2025-07-29 14:51:24.259416+02	2025-08-05 16:41:39.263002+02	f	\N
5r8ns0l14v603jmhtiousj5noj	massimo luminoso tg	\N	\N	2025-07-09 18:30:00+02	2025-07-09 19:00:00+02	qualityhairbolzano@gmail.com	2025-07-04 18:32:50.133+02	2025-07-29 14:51:24.298441+02	2025-07-29 14:51:24.298441+02	f	7
7gnjp8bo7cvqno5di4vj767i0l	Lorenzo Gattolin tg barba (pagato)	\N	\N	2025-07-26 08:30:00+02	2025-07-26 09:30:00+02	qualityhairbolzano@gmail.com	2025-07-05 10:57:42.688+02	2025-07-29 14:51:24.299646+02	2025-07-29 14:51:24.299646+02	f	\N
1g87nvem6358kd6rasl837vgra	ennio ambrosi	\N	\N	2025-07-12 10:30:00+02	2025-07-12 11:00:00+02	qualityhairbolzano@gmail.com	2025-07-05 11:21:46.999+02	2025-07-29 14:51:24.300759+02	2025-07-29 14:51:24.300759+02	f	7
1g6vmsjr7qvqd5t33qpqhv75bv	roberto pagliarin tg	\N	\N	2025-07-05 13:00:00+02	2025-07-05 13:30:00+02	tlpebaby2000@gmail.com	2025-07-05 12:07:38.061+02	2025-07-29 14:51:24.301861+02	2025-07-29 14:51:24.301861+02	f	7
22oos33ou88bf6b8b3aocv9tnj	Vito Pul	\N	\N	2025-07-12 12:00:00+02	2025-07-12 12:30:00+02	sandro.stefanati@gmail.com	2025-07-05 12:45:22.536+02	2025-07-29 14:51:24.30307+02	2025-07-29 14:51:24.30307+02	f	\N
125b56i6rsq7gba94390fj3lop	Patty P	\N	\N	2025-07-15 08:45:00+02	2025-07-15 09:15:00+02	qualityhairbolzano@gmail.com	2025-07-05 12:45:38.799+02	2025-07-29 14:51:24.304194+02	2025-07-29 14:51:24.304194+02	f	\N
60rjad9icopj4b9l70r6ab9k75hj6b9p6lij6bb168o30cb46oq36p1hco	Anto p	\N	\N	2025-07-05 16:00:00+02	2025-07-05 16:45:00+02	qualityhairbolzano@gmail.com	2025-07-05 13:10:10.666+02	2025-07-29 14:51:24.305297+02	2025-07-29 14:51:24.305297+02	f	\N
5e6t4hib8vh1p1q0f1fhvpu6v1	Vito Tg	\N	\N	2025-08-02 12:30:00+02	2025-08-02 13:00:00+02	qualityhairbolzano@gmail.com	2025-07-05 13:31:15.472+02	2025-07-29 14:51:24.306393+02	2025-07-29 14:51:24.306393+02	f	\N
1m091854q3is528k94hphcqnkh	Patty P	\N	\N	2025-08-02 12:00:00+02	2025-08-02 12:30:00+02	sandro.stefanati@gmail.com	2025-07-05 13:31:29.685+02	2025-07-29 14:51:24.30775+02	2025-07-29 14:51:24.30775+02	f	\N
6ao7nkpuff6q98v1rrr82i8g2b	Adam Rozack tg	\N	\N	2025-07-05 14:30:00+02	2025-07-05 15:00:00+02	qualityhairbolzano@gmail.com	2025-07-05 13:59:16.818+02	2025-07-29 14:51:24.309143+02	2025-07-29 14:51:24.309143+02	f	\N
6orjgdpiccs68bb265j3ib9kccq6cbb160r3gb9l74qm4chi70r3ic9h64	Luca Moscon flash tg	\N	\N	2025-07-08 18:00:00+02	2025-07-08 18:45:00+02	qualityhairbolzano@gmail.com	2025-07-07 08:52:51.525+02	2025-07-29 14:51:24.310343+02	2025-07-29 14:51:24.310343+02	f	\N
28m8sgofp121d647pscpgi8fkg	Mauro Piliego tg	\N	\N	2025-07-08 17:15:00+02	2025-07-08 17:45:00+02	sandro.stefanati@gmail.com	2025-07-08 10:02:14.569+02	2025-07-29 14:51:24.311464+02	2025-07-29 14:51:24.311464+02	f	\N
7q1sme3c1sg80h6rostcangb8c	Riccardo tg	\N	\N	2025-07-09 18:00:00+02	2025-07-09 18:30:00+02	tlpebaby2000@gmail.com	2025-07-08 15:28:49.84+02	2025-07-29 14:51:24.312591+02	2025-07-29 14:51:24.312591+02	f	\N
4e7jeojcairuj8079qh78l6gq8	Sigfried Putz tg	\N	\N	2025-07-09 11:00:00+02	2025-07-09 11:30:00+02	qualityhairbolzano@gmail.com	2025-07-08 16:25:09.683+02	2025-07-29 14:51:24.313703+02	2025-07-29 14:51:24.313703+02	f	\N
719389bdrsjg2emqkecn961uhv	Livio Ruvioatti Tg	\N	\N	2025-07-09 10:00:00+02	2025-07-09 10:30:00+02	sandro.stefanati@gmail.com	2025-07-08 16:39:04.004+02	2025-07-29 14:51:24.31486+02	2025-07-29 14:51:24.31486+02	f	\N
33mukmtjlhadvbkvad0kh7reqa	Giuliano Pandolfi tg	\N	\N	2025-07-09 08:15:00+02	2025-07-09 08:45:00+02	qualityhairbolzano@gmail.com	2025-07-09 08:39:57.53+02	2025-07-29 14:51:24.315966+02	2025-07-29 14:51:24.315966+02	f	\N
3e5ljp12jqb0c55n3g66ufs5pa	Romano Beaco tg barba	\N	\N	2025-07-09 16:30:00+02	2025-07-09 17:30:00+02	sandro.stefanati@gmail.com	2025-07-09 08:55:53.683+02	2025-07-29 14:51:24.317072+02	2025-07-29 14:51:24.317072+02	f	\N
6lebak4e88ev5o0qi1le9erk10	luciano strufi tg	\N	\N	2025-07-09 11:00:00+02	2025-07-09 11:30:00+02	tlpebaby2000@gmail.com	2025-07-09 10:27:11.771+02	2025-07-29 14:51:24.318162+02	2025-07-29 14:51:24.318162+02	f	7
4fm1g0i46chvd2enb5c08cfm3i	Marco Dipasquale tg	\N	\N	2025-07-10 12:30:00+02	2025-07-10 13:00:00+02	sandro.stefanati@gmail.com	2025-07-09 13:58:22.271+02	2025-07-29 14:51:24.319249+02	2025-07-29 14:51:24.319249+02	f	\N
41vmlum45nde7eba13ro5qqbuq	Amos Bevilacqua tg	\N	\N	2025-07-10 11:00:00+02	2025-07-10 11:30:00+02	qualityhairbolzano@gmail.com	2025-07-09 15:12:19.187+02	2025-07-29 14:51:24.320345+02	2025-07-29 14:51:24.320345+02	f	\N
6m5hgpiird92r2ev0hrapre99t	Fabrizio Gerometta tg	\N	\N	2025-07-22 15:00:00+02	2025-07-22 15:30:00+02	qualityhairbolzano@gmail.com	2025-07-09 15:36:29.228+02	2025-07-29 14:51:24.321636+02	2025-07-29 14:51:24.321636+02	f	\N
2g8ea5efj0s60q27237pcsjmt5	katiuscia tn tg	\N	\N	2025-07-18 15:00:00+02	2025-07-18 17:00:00+02	tlpebaby2000@gmail.com	2025-07-09 16:04:46.404+02	2025-07-29 14:51:24.323389+02	2025-07-29 14:51:24.323389+02	f	\N
4ngkh55f8eqcd7poo9p7sjs907	Paola Zimmermann tn tg	\N	\N	2025-07-11 15:00:00+02	2025-07-11 17:00:00+02	qualityhairbolzano@gmail.com	2025-07-09 17:53:58.242+02	2025-07-29 14:51:24.325513+02	2025-07-29 14:51:24.325513+02	f	\N
3eckk9i4oc41qbd5b97dhokbk6	Mario Marini tg	\N	\N	2025-07-10 10:00:00+02	2025-07-10 10:30:00+02	qualityhairbolzano@gmail.com	2025-07-10 08:12:24.362+02	2025-07-29 14:51:24.327068+02	2025-07-29 14:51:24.327068+02	f	7
11tldg289r5hkf4j938rcng31g	Lombardozzi tg	\N	\N	2025-07-15 10:30:00+02	2025-07-15 11:00:00+02	qualityhairbolzano@gmail.com	2025-07-10 08:25:23.729+02	2025-07-29 14:51:24.328338+02	2025-07-29 14:51:24.328338+02	f	\N
7ao78lihtfqjrrmm1bi9civgak	Franco Beccaro tg	\N	\N	2025-07-11 08:30:00+02	2025-07-11 09:00:00+02	sandro.stefanati@gmail.com	2025-07-10 08:47:27.956+02	2025-07-29 14:51:24.32953+02	2025-07-29 14:51:24.32953+02	f	\N
55la7lbulmiostito61imd5851	Loredana Gobbetti tn	\N	\N	2025-07-10 08:15:00+02	2025-07-10 09:30:00+02	qualityhairbolzano@gmail.com	2025-07-10 09:35:19.878+02	2025-07-29 14:51:24.330704+02	2025-07-29 14:51:24.330704+02	f	\N
2i0ghktlsvmqm4f4rmm6b86lm7	walter morandi tg	\N	\N	2025-07-10 13:00:00+02	2025-07-10 13:30:00+02	tlpebaby2000@gmail.com	2025-07-10 09:47:05.42+02	2025-07-29 14:51:24.331904+02	2025-07-29 14:51:24.331904+02	f	7
0c7mnjm9mt17ff09s6ndu8tomu	mauro bergonzini tg	\N	\N	2025-07-11 10:00:00+02	2025-07-11 10:30:00+02	tlpebaby2000@gmail.com	2025-07-10 10:09:23.556+02	2025-07-29 14:51:24.333099+02	2025-07-29 14:51:24.333099+02	f	7
1jl0ctds91iqt8ho9psfd3bbgb	Luca Atzei tg	\N	\N	2025-07-10 17:00:00+02	2025-07-10 17:30:00+02	sandro.stefanati@gmail.com	2025-07-10 11:34:33.007+02	2025-07-29 14:51:24.334241+02	2025-07-29 14:51:24.334241+02	f	7
6aljd480bh37ub4r96t364b77n	guglielmo tomazzoni tg	\N	\N	2025-07-11 10:00:00+02	2025-07-11 10:30:00+02	tlpebaby2000@gmail.com	2025-07-10 15:11:48.806+02	2025-07-29 14:51:24.335375+02	2025-07-29 14:51:24.335375+02	f	\N
55nnudu0l84d7vgu0m3lmfekl0	Erica Oxenreiter tn	\N	\N	2025-07-10 15:00:00+02	2025-07-10 16:30:00+02	sandro.stefanati@gmail.com	2025-07-10 16:30:40.374+02	2025-07-29 14:51:24.336627+02	2025-07-29 14:51:24.336627+02	f	\N
7uoln8rnkogifae7hm7g0ncpmu	Marco Santuliana tg	\N	\N	2025-07-15 17:00:00+02	2025-07-15 17:30:00+02	sandro.stefanati@gmail.com	2025-07-10 18:19:07.65+02	2025-07-29 14:51:24.338193+02	2025-07-29 14:51:24.338193+02	f	\N
6kirks5ng8d4bj5r5a9gcvbht4	Andrea Tioli tg	\N	\N	2025-07-10 17:30:00+02	2025-07-10 18:00:00+02	qualityhairbolzano@gmail.com	2025-07-10 18:22:46.894+02	2025-07-29 14:51:24.339922+02	2025-07-29 14:51:24.339922+02	f	\N
06apugbiulp3657h05lq8eae9n	Matteo Piazza Pul	\N	\N	2025-07-12 09:30:00+02	2025-07-12 10:00:00+02	sandro.stefanati@gmail.com	2025-07-10 18:24:29.99+02	2025-07-29 14:51:24.34149+02	2025-07-29 14:51:24.34149+02	f	\N
49r5gpjoheooc123bd31mmlhsm	Daniela Ketmaier tratt	\N	\N	2025-07-18 17:30:00+02	2025-07-18 18:15:00+02	qualityhairbolzano@gmail.com	2025-07-11 11:34:57.998+02	2025-07-29 14:51:24.342946+02	2025-07-29 14:51:24.342946+02	f	\N
3e86n86jmlimt0092c4qe8133q	Daniela Ketmaier tratt	\N	\N	2025-07-11 11:00:00+02	2025-07-11 11:45:00+02	qualityhairbolzano@gmail.com	2025-07-11 11:38:09.381+02	2025-07-29 14:51:24.344185+02	2025-07-29 14:51:24.344185+02	f	\N
1llng7nra1jigefu4lerotccjd	Vincenzo Carpinelli tg barba 	\N	\N	2025-07-11 13:00:00+02	2025-07-11 14:00:00+02	qualityhairbolzano@gmail.com	2025-07-11 12:35:41.682+02	2025-07-29 14:51:24.345439+02	2025-07-29 14:51:24.345439+02	f	\N
0419bh2pd4uigjgav19ga70kmf	Ingo Sayer tg	\N	\N	2025-07-12 10:30:00+02	2025-07-12 11:00:00+02	qualityhairbolzano@gmail.com	2025-07-11 16:50:11.456+02	2025-07-29 14:51:24.346603+02	2025-07-29 14:51:24.346603+02	f	\N
7l2tktg8lmrr0rtda186t3m015	Matteo Piazza tg barba	\N	\N	2025-07-24 13:00:00+02	2025-07-24 13:45:00+02	qualityhairbolzano@gmail.com	2025-07-12 09:42:27.053+02	2025-07-29 14:51:24.347997+02	2025-07-29 14:51:24.347997+02	f	\N
5mv7mm4ur4l28pi0jjiugosu5v	Vito Pul	\N	\N	2025-07-19 12:00:00+02	2025-07-19 12:30:00+02	qualityhairbolzano@gmail.com	2025-07-12 12:08:02.604+02	2025-07-29 14:51:24.3518+02	2025-07-29 14:51:24.3518+02	f	7
3tg6np8gpu8d3fm97qgbaj26o2	Thomas Stein tg barba	\N	\N	2025-07-17 17:15:00+02	2025-07-17 18:15:00+02	sandro.stefanati@gmail.com	2025-07-12 15:36:46.44+02	2025-07-29 14:51:24.353968+02	2025-07-29 14:51:24.353968+02	f	\N
chgj6e9l70o32b9l64qmab9k69gm2bb268s68b9ocdh34dr56oo3adb6c4	Kicco Brugiatelli tg	\N	\N	2025-07-15 18:00:00+02	2025-07-15 18:30:00+02	qualityhairbolzano@gmail.com	2025-07-14 16:55:40.751+02	2025-07-29 14:51:24.355711+02	2025-07-29 14:51:24.355711+02	f	\N
21srtf183kdtmnk2lc36vlf86i	martellozzo tg	\N	\N	2025-07-15 11:00:00+02	2025-07-15 11:30:00+02	qualityhairbolzano@gmail.com	2025-07-15 08:17:16.153+02	2025-07-29 14:51:24.357042+02	2025-07-29 14:51:24.357042+02	f	\N
69ktgvaa4bhdtctucru78hmc8s	andreas huber tg	\N	\N	2025-07-15 10:15:00+02	2025-07-15 10:45:00+02	tlpebaby2000@gmail.com	2025-07-15 09:52:21.682+02	2025-07-29 14:51:24.359845+02	2025-07-29 14:51:24.359845+02	f	7
4guvcvs5bmebq4fjidrlf4sc3f	Giuliano Pandolfi tg	\N	\N	2025-07-25 08:30:00+02	2025-07-25 09:00:00+02	sandro.stefanati@gmail.com	2025-07-15 17:51:13.469+02	2025-07-29 14:51:24.361049+02	2025-07-29 14:51:24.361049+02	f	\N
5o2j0ssbgm8rmo2fp7n6g878la	platner piega	\N	\N	2025-07-16 15:00:00+02	2025-07-16 15:30:00+02	qualityhairbolzano@gmail.com	2025-07-15 18:41:24.386+02	2025-07-29 14:51:24.362226+02	2025-07-29 14:51:24.362226+02	f	7
4304pitpsrq1i8vf4st9lfo13o	Fauzia Segna balajage +tn	\N	\N	2025-07-29 15:00:00+02	2025-07-29 18:15:00+02	sandro.stefanati@gmail.com	2025-07-29 18:11:58.144+02	2025-07-29 14:51:24.349774+02	2025-07-29 18:13:26.790245+02	f	\N
1o0jud2t8dar1m7i2qjmpv0mfa	Simone Degiacinto tg	\N	\N	2025-07-25 13:00:00+02	2025-07-25 13:45:00+02	qualityhairbolzano@gmail.com	2025-07-16 08:38:02.541+02	2025-07-29 14:51:24.36335+02	2025-07-29 14:51:24.36335+02	f	\N
5je1j4ad1le6jq91njec9pjkhs	MariaGrazia Sporaore tg	\N	\N	2025-07-16 08:30:00+02	2025-07-16 09:00:00+02	qualityhairbolzano@gmail.com	2025-07-16 08:55:06.7+02	2025-07-29 14:51:24.364588+02	2025-07-29 14:51:24.364588+02	f	\N
1g90frth2pm6vtri2v6jkv8s6n	Felix tg	\N	\N	2025-07-24 17:30:00+02	2025-07-24 18:00:00+02	qualityhairbolzano@gmail.com	2025-07-16 09:40:28.033+02	2025-07-29 14:51:24.36572+02	2025-07-29 14:51:24.36572+02	f	\N
35pdbi0kl7mr1arfagblcnm7b9	gasser franz tg	\N	\N	2025-07-16 16:00:00+02	2025-07-16 16:30:00+02	tlpebaby2000@gmail.com	2025-07-16 10:02:37.63+02	2025-07-29 14:51:24.366858+02	2025-07-29 14:51:24.366858+02	f	7
1us1jnip70h06aephc2kk3m602	Renato Zecchini tg barba	\N	\N	2025-07-16 09:30:00+02	2025-07-16 10:15:00+02	qualityhairbolzano@gmail.com	2025-07-16 10:06:57.28+02	2025-07-29 14:51:24.367964+02	2025-07-29 14:51:24.367964+02	f	\N
3th20m5uhitskrvrebbamdbao8	Margherita Cristoforetti tg	\N	\N	2025-07-16 10:15:00+02	2025-07-16 10:45:00+02	qualityhairbolzano@gmail.com	2025-07-16 10:48:16.058+02	2025-07-29 14:51:24.369058+02	2025-07-29 14:51:24.369058+02	f	\N
5582shoffan4p118s6qea19im9	Al Pasquali tg	\N	\N	2025-07-19 11:00:00+02	2025-07-19 11:30:00+02	sandro.stefanati@gmail.com	2025-07-16 14:47:43.359+02	2025-07-29 14:51:24.370399+02	2025-07-29 14:51:24.370399+02	f	\N
56au3mj0jbmvckr367ao5hrqma	daniela brancaglion tn	\N	\N	2025-07-17 10:00:00+02	2025-07-17 12:00:00+02	tlpebaby2000@gmail.com	2025-07-16 15:06:19.997+02	2025-07-29 14:51:24.371563+02	2025-07-29 14:51:24.371563+02	f	7
5t4mv8b511sdp4rmgm6unb1ptg	Massimo Tomio tg	\N	\N	2025-07-17 13:00:00+02	2025-07-17 13:30:00+02	qualityhairbolzano@gmail.com	2025-07-16 15:20:44.401+02	2025-07-29 14:51:24.37267+02	2025-07-29 14:51:24.37267+02	f	7
0nqejge17438sbrahm5heh481j	Roberto Frenademez tg	\N	\N	2025-07-17 14:30:00+02	2025-07-17 15:00:00+02	qualityhairbolzano@gmail.com	2025-07-16 15:57:30.322+02	2025-07-29 14:51:24.373762+02	2025-07-29 14:51:24.373762+02	f	7
42luo025fum6345a266o4a2sg8	Tchennet tg	\N	\N	2025-07-16 17:00:00+02	2025-07-16 17:30:00+02	qualityhairbolzano@gmail.com	2025-07-16 16:24:13.253+02	2025-07-29 14:51:24.375224+02	2025-07-29 14:51:24.375224+02	f	7
4n5s9nlr4ch9enljnqbrlj8gpb	Mara Demarchi tn tg	\N	\N	2025-08-13 15:00:00+02	2025-08-13 16:45:00+02	qualityhairbolzano@gmail.com	2025-07-16 16:44:11.169+02	2025-07-29 14:51:24.376553+02	2025-07-29 14:51:24.376553+02	f	\N
69esg87rccvds42pi2gqtu0t1v	carlo ceccon tg	\N	\N	2025-07-17 10:30:00+02	2025-07-17 11:00:00+02	tlpebaby2000@gmail.com	2025-07-17 08:40:34.118+02	2025-07-29 14:51:24.377714+02	2025-07-29 14:51:24.377714+02	f	\N
45l7t8nfhp5239gv2pcd0c623l	Claudia Dotti tn tg	\N	\N	2025-07-17 08:30:00+02	2025-07-17 10:00:00+02	qualityhairbolzano@gmail.com	2025-07-17 09:57:36.777+02	2025-07-29 14:51:24.378863+02	2025-07-29 14:51:24.378863+02	f	\N
01rnb37cm8qpqrg0247dv8e4fg	Patty P 	\N	\N	2025-07-19 12:00:00+02	2025-07-19 12:30:00+02	qualityhairbolzano@gmail.com	2025-07-17 11:48:34.961+02	2025-07-29 14:51:24.379977+02	2025-07-29 14:51:24.379977+02	f	\N
3jcrsoclj02bp12m8qenpdp4r2	Andrea Baruffaldi tg	\N	\N	2025-07-19 13:00:00+02	2025-07-19 13:30:00+02	sandro.stefanati@gmail.com	2025-07-17 16:17:48.097+02	2025-07-29 14:51:24.381107+02	2025-07-29 14:51:24.381107+02	f	\N
1lq9kg5m4u5al68ojm96v0apin	ennio ambrosi p	\N	\N	2025-07-19 11:00:00+02	2025-07-19 11:30:00+02	qualityhairbolzano@gmail.com	2025-07-17 16:50:47.376+02	2025-07-29 14:51:24.383289+02	2025-07-29 14:51:24.383289+02	f	7
6dgj4d9lc4s3ibb5c5gj0b9k6oqm2bb1coo66b9g74sjadphcli32eb1co	Vito pul	\N	\N	2025-07-26 12:00:00+02	2025-07-26 12:30:00+02	qualityhairbolzano@gmail.com	2025-07-18 08:03:09.62+02	2025-07-29 14:51:24.38437+02	2025-07-29 14:51:24.38437+02	f	7
corm8d3470qm6bb4c8o6ab9k74q6abb268sjebb1coo32cpocpgmad1l6k	Patty p	\N	\N	2025-07-26 12:00:00+02	2025-07-26 12:30:00+02	qualityhairbolzano@gmail.com	2025-07-18 08:03:27.141+02	2025-07-29 14:51:24.38551+02	2025-07-29 14:51:24.38551+02	f	\N
1ka4dnj08fi21eb0m1gk3v4blg	Verena Maier p	\N	\N	2025-07-18 10:00:00+02	2025-07-18 10:45:00+02	qualityhairbolzano@gmail.com	2025-07-18 10:40:45.892+02	2025-07-29 14:51:24.386595+02	2025-07-29 14:51:24.386595+02	f	\N
5gqq4mbug83q0dga6qi053o2ib	Gabriele Salvadori tg	\N	\N	2025-07-19 13:30:00+02	2025-07-19 14:00:00+02	sandro.stefanati@gmail.com	2025-07-18 10:51:07.56+02	2025-07-29 14:51:24.387693+02	2025-07-29 14:51:24.387693+02	f	\N
5gt67qhsella7p8snhaak1uagk	Carla Spiller tn	\N	\N	2025-07-23 15:00:00+02	2025-07-23 17:00:00+02	qualityhairbolzano@gmail.com	2025-07-18 12:04:46.773+02	2025-07-29 14:51:24.388773+02	2025-07-29 14:51:24.388773+02	f	\N
5qkup64bakq6imqgkk34evva7s	costa mattias tg	\N	\N	2025-07-18 17:30:00+02	2025-07-18 18:00:00+02	tlpebaby2000@gmail.com	2025-07-18 14:27:57.2+02	2025-07-29 14:51:24.389936+02	2025-07-29 14:51:24.389936+02	f	7
70pjep1j6cr3cbb464p68b9k68o3cb9pc9i3cb9i68ojed3668o3ecj1cc	Anto tn	\N	\N	2025-07-19 15:00:00+02	2025-07-19 17:00:00+02	qualityhairbolzano@gmail.com	2025-07-19 08:07:18.388+02	2025-07-29 14:51:24.391048+02	2025-07-29 14:51:24.391048+02	f	\N
2fvt07uftn7sjfoidvo515vv8t	Fabio Gattolin tg barba	\N	\N	2025-07-19 14:00:00+02	2025-07-19 15:00:00+02	qualityhairbolzano@gmail.com	2025-07-19 08:44:54.248+02	2025-07-29 14:51:24.392278+02	2025-07-29 14:51:24.392278+02	f	\N
5scbra2mccb075hgg2nusuq94c	Michela Albanese tn	\N	\N	2025-08-16 08:30:00+02	2025-08-16 10:00:00+02	qualityhairbolzano@gmail.com	2025-07-19 10:04:43.313+02	2025-07-29 14:51:24.393529+02	2025-07-29 14:51:24.393529+02	f	\N
1h8sjgc59mbp0udlgd6daremnt	Piietro Marini tg	\N	\N	2025-07-24 16:00:00+02	2025-07-24 16:30:00+02	qualityhairbolzano@gmail.com	2025-07-19 10:05:59.24+02	2025-07-29 14:51:24.394694+02	2025-07-29 14:51:24.394694+02	f	\N
01mn7hhlg4o94r5dkvnlflcu8m	Andrea Baruffaldi tg	\N	\N	2025-08-09 13:00:00+02	2025-08-09 13:30:00+02	qualityhairbolzano@gmail.com	2025-07-19 13:26:55.469+02	2025-07-29 14:51:24.395813+02	2025-07-29 14:51:24.395813+02	f	\N
6kkdghec0eu0bcg95l7dga7116	Carlo Döcker tg	\N	\N	2025-07-22 10:15:00+02	2025-07-22 10:45:00+02	qualityhairbolzano@gmail.com	2025-07-22 09:21:03.258+02	2025-07-29 14:51:24.39691+02	2025-07-29 14:51:24.39691+02	f	\N
55ukqlhehheedos2m9q1ps3i9f	Fabrizio Gerometta tg	\N	\N	2025-08-20 15:00:00+02	2025-08-20 15:30:00+02	qualityhairbolzano@gmail.com	2025-07-22 15:20:05.373+02	2025-07-29 14:51:24.398006+02	2025-07-29 14:51:24.398006+02	f	\N
2t6d5jl8om7a248jsiuid5f0b0	Nonna Gozzi tg	\N	\N	2025-07-30 11:00:00+02	2025-07-30 11:30:00+02	qualityhairbolzano@gmail.com	2025-07-22 16:00:19.8+02	2025-07-29 14:51:24.399181+02	2025-07-29 14:51:24.399181+02	f	\N
21eddfpjgnc60a5vb4n85mvicn	MariaRosa Serafini tn tg	\N	\N	2025-07-22 15:30:00+02	2025-07-22 17:15:00+02	qualityhairbolzano@gmail.com	2025-07-22 17:40:55.577+02	2025-07-29 14:51:24.40041+02	2025-07-29 14:51:24.40041+02	f	\N
4gtea0qt28f95v1ofuj5bob0q1	Luca Nalin tg	\N	\N	2025-07-23 11:00:00+02	2025-07-23 11:30:00+02	sandro.stefanati@gmail.com	2025-07-23 08:43:03.262+02	2025-07-29 14:51:24.401576+02	2025-07-29 14:51:24.401576+02	f	\N
4gk039e4ftjeflja3qkblt520u	Daniela Ketmaier tratt	\N	\N	2025-07-26 13:00:00+02	2025-07-26 13:45:00+02	qualityhairbolzano@gmail.com	2025-07-23 09:46:09.378+02	2025-07-29 14:51:24.402672+02	2025-07-29 14:51:24.402672+02	f	\N
66ouhcvihaepljphb0kp1ii2cn	luciano dalla villa tg	\N	\N	2025-07-25 10:30:00+02	2025-07-25 11:00:00+02	tlpebaby2000@gmail.com	2025-07-23 14:53:36.844+02	2025-07-29 14:51:24.403782+02	2025-07-29 14:51:24.403782+02	f	7
1to9s9ndjgguks2u5m6ulje2ov	Enrico Lubiato tg	\N	\N	2025-07-25 12:00:00+02	2025-07-25 12:30:00+02	sandro.stefanati@gmail.com	2025-07-23 18:00:40.446+02	2025-07-29 14:51:24.404968+02	2025-07-29 14:51:24.404968+02	f	\N
3f7lhr4h1bm595sbbg6dnbjqns	Loredana Gobbetti P	\N	\N	2025-07-24 16:30:00+02	2025-07-24 17:00:00+02	qualityhairbolzano@gmail.com	2025-07-23 20:16:49.024+02	2025-07-29 14:51:24.406195+02	2025-07-29 14:51:24.406195+02	f	\N
6o3g9r43o08568nqrttur9gnmb	Massimo Rossetto tg	\N	\N	2025-07-24 18:00:00+02	2025-07-24 18:30:00+02	sandro.stefanati@gmail.com	2025-07-24 08:48:18.455+02	2025-07-29 14:51:24.407335+02	2025-07-29 14:51:24.407335+02	f	\N
1ksmkd234utkfj9sui1okpbcif	ambrosi Ennio	\N	\N	2025-07-26 11:00:00+02	2025-07-26 11:30:00+02	qualityhairbolzano@gmail.com	2025-07-24 10:25:32.028+02	2025-07-29 14:51:24.410025+02	2025-07-29 14:51:24.410025+02	f	7
0j9c5j8dlakqbqmgjcnf6qv2mi	Matteo Piazza pul	\N	\N	2025-08-14 13:00:00+02	2025-08-14 13:30:00+02	qualityhairbolzano@gmail.com	2025-07-24 13:32:59.882+02	2025-07-29 14:51:24.411179+02	2025-07-29 14:51:24.411179+02	f	\N
0hp2jq1khimdnvrr1ou2o5ijg4	Gianluca Govannini tg	\N	\N	2025-07-25 18:00:00+02	2025-07-25 18:30:00+02	qualityhairbolzano@gmail.com	2025-07-24 15:27:38.701+02	2025-07-29 14:51:24.412292+02	2025-07-29 14:51:24.412292+02	f	\N
2bmq3878efu2kihcme6uiploq5	Gianpietro (sister) tg	\N	\N	2025-07-29 10:30:00+02	2025-07-29 11:00:00+02	sandro.stefanati@gmail.com	2025-07-24 15:42:48.948+02	2025-07-29 14:51:24.413433+02	2025-07-29 14:51:24.413433+02	f	\N
5a354jrtfcfte23o7sgltd13aq	Lucia Saccani tn tg	\N	\N	2025-07-24 14:00:00+02	2025-07-24 15:30:00+02	qualityhairbolzano@gmail.com	2025-07-24 16:47:52.398+02	2025-07-29 14:51:24.414528+02	2025-07-29 14:51:24.414528+02	f	\N
21fbk6klchvtuj9o98v65bbv17	Felix tratt +tg	\N	\N	2025-08-14 18:00:00+02	2025-08-14 18:45:00+02	qualityhairbolzano@gmail.com	2025-07-24 17:46:41.225+02	2025-07-29 14:51:24.415633+02	2025-07-29 14:51:24.415633+02	f	\N
7sisp37bt9u657arq0bktl42u1	Nelli Seilor tg	\N	\N	2025-07-25 14:30:00+02	2025-07-25 15:15:00+02	qualityhairbolzano@gmail.com	2025-07-25 08:14:00.276+02	2025-07-29 14:51:24.416771+02	2025-07-29 14:51:24.416771+02	f	\N
1bcncijkjja3cqelhrm80gmg56	 massimo biasin tg	\N	\N	2025-07-23 17:30:00+02	2025-07-23 18:00:00+02	sandro.stefanati@gmail.com	2025-07-25 08:15:12.162+02	2025-07-29 14:51:24.417886+02	2025-07-29 14:51:24.417886+02	f	7
0f2n6molrctrhafh2l5pnge053	Giorgia Arman tn tg	\N	\N	2025-07-30 15:00:00+02	2025-07-30 17:00:00+02	qualityhairbolzano@gmail.com	2025-07-25 11:38:12.055+02	2025-07-29 14:51:24.418975+02	2025-07-29 14:51:24.418975+02	f	\N
0g0bq09rkbfhjqk1o5qb3srdpe	Sonia Fontana tn	\N	\N	2025-08-09 08:30:00+02	2025-08-09 10:30:00+02	qualityhairbolzano@gmail.com	2025-08-09 09:51:37.001+02	2025-07-29 14:51:24.382202+02	2025-08-09 12:17:17.926701+02	f	\N
52lhsl2qvo6g2r6uddk02j76a5	Alessandra Viezzoli tn	\N	\N	2025-07-25 10:00:00+02	2025-07-25 11:45:00+02	sandro.stefanati@gmail.com	2025-07-25 11:52:41.3+02	2025-07-29 14:51:24.420058+02	2025-07-29 14:51:24.420058+02	f	\N
5cm22hc4clqqkm3n7rvnjl2kt7	Simone Degiacinto tg	\N	\N	2025-08-13 17:30:00+02	2025-08-13 18:15:00+02	qualityhairbolzano@gmail.com	2025-07-25 13:30:49.93+02	2025-07-29 14:51:24.421236+02	2025-07-29 14:51:24.421236+02	f	\N
66u06k3tbiblo8p57h9t33n479	Stefan Varesco tn	\N	\N	2025-07-25 16:00:00+02	2025-07-25 17:15:00+02	sandro.stefanati@gmail.com	2025-07-25 16:23:35.897+02	2025-07-29 14:51:24.422355+02	2025-07-29 14:51:24.422355+02	f	\N
67us9dgrsj0cqnk7ommuuacsed	Loredana Gobbetti p	\N	\N	2025-07-31 08:30:00+02	2025-07-31 09:00:00+02	sandro.stefanati@gmail.com	2025-07-25 17:12:06.756+02	2025-07-29 14:51:24.423443+02	2025-07-29 14:51:24.423443+02	f	\N
42l984va1c1r71j5jd1pv76tt0	Lorenzo Gattolin barba	\N	\N	2025-08-12 18:00:00+02	2025-08-12 18:30:00+02	qualityhairbolzano@gmail.com	2025-07-26 09:28:37.721+02	2025-07-29 14:51:24.424519+02	2025-07-29 14:51:24.424519+02	f	\N
0dlr3jc5c83qq5rnk3ffir0hb5	Lorenzo Gattolin tg barba	\N	\N	2025-08-23 08:30:00+02	2025-08-23 09:00:00+02	qualityhairbolzano@gmail.com	2025-07-26 09:29:53.624+02	2025-07-29 14:51:24.425755+02	2025-07-29 14:51:24.425755+02	f	\N
589tfmcu4nnr01tg9h7pfb45oo	ennio ambrosi	\N	\N	2025-08-02 11:00:00+02	2025-08-02 11:30:00+02	qualityhairbolzano@gmail.com	2025-07-26 11:23:04.885+02	2025-07-29 14:51:24.427107+02	2025-07-29 14:51:24.427107+02	f	7
coqj6p1nc4o6cb9n6hh3gb9k71ij6bb16ks3abb3c4p6ae3571gm2e336k	Paolo DallaPiazza tr tg	\N	\N	2025-07-31 17:00:00+02	2025-07-31 17:45:00+02	qualityhairbolzano@gmail.com	2025-07-27 20:37:07.688+02	2025-07-29 14:51:24.429376+02	2025-07-29 14:51:24.429376+02	f	\N
15eu9frpinl4vclvavqhkcir3r	Luca Ianeselli tr tg barba	\N	\N	2025-08-07 12:30:00+02	2025-08-07 13:45:00+02	qualityhairbolzano@gmail.com	2025-07-28 07:44:34.993+02	2025-07-29 14:51:24.430503+02	2025-07-29 14:51:24.430503+02	f	\N
30h9vijp1v510f7hplq5dh0831	no tino 	\N	\N	2025-08-12 00:00:00+02	2025-08-17 00:00:00+02	sandro.stefanati@gmail.com	2025-07-29 08:20:16.257+02	2025-07-29 14:51:24.432859+02	2025-07-29 14:51:24.432859+02	t	7
7nc8lohfbemskdaiftb59fosjf	Renzo Gilodi tg	\N	\N	2025-07-31 10:00:00+02	2025-07-31 10:30:00+02	sandro.stefanati@gmail.com	2025-07-29 09:30:43.824+02	2025-07-29 14:51:24.435054+02	2025-07-29 14:51:24.435054+02	f	\N
10ps2iuf03denb82hu958pumhp	Antonio Gonzo flash tg	\N	\N	2025-07-30 17:30:00+02	2025-07-30 18:15:00+02	qualityhairbolzano@gmail.com	2025-07-29 10:57:43.535+02	2025-07-29 14:51:24.436157+02	2025-07-29 14:51:24.436157+02	f	\N
5fobaevfsnumueduirhi2ag1br	barbara vio tn	\N	\N	2025-08-02 10:00:00+02	2025-08-02 12:00:00+02	tlpebaby2000@gmail.com	2025-07-29 14:06:14.049+02	2025-07-29 14:51:24.437239+02	2025-07-29 14:51:24.437239+02	f	7
2qgicbjjfr4ucqqukmqmtlq2fr	sparapani tg	\N	\N	2025-07-29 15:30:00+02	2025-07-29 16:00:00+02	tlpebaby2000@gmail.com	2025-07-29 15:02:55.605+02	2025-07-29 17:06:29.474318+02	2025-07-29 17:06:29.474318+02	f	7
7ub0nklc4s6j59j51f0ov5g3p6	Emilio Corea tg	\N	\N	2025-07-29 18:15:00+02	2025-07-29 18:45:00+02	qualityhairbolzano@gmail.com	2025-07-29 18:11:56.243+02	2025-07-29 14:51:24.408757+02	2025-07-29 18:13:26.783586+02	f	\N
1ih6od6hmtkre5idhc5mgfb2p2	Isabella todesco tg	\N	\N	2025-07-30 10:00:00+02	2025-07-30 10:30:00+02	qualityhairbolzano@gmail.com	2025-07-30 09:21:41.46+02	2025-07-29 14:51:24.433954+02	2025-07-30 09:22:04.15049+02	f	\N
4vuvhlsf8lof19h1mtlu59bnip	Ricky Gozzi tg	\N	\N	2025-07-31 15:30:00+02	2025-07-31 16:00:00+02	sandro.stefanati@gmail.com	2025-07-30 11:32:47.042+02	2025-07-30 15:49:01.730417+02	2025-07-30 15:49:01.730417+02	f	\N
6tgmcp1m70pm4b9pcks3cb9k61hjgbb2ckpmabb270qj8c1p75i3ce9h6k	Paolo Cassetti tg	\N	\N	2025-08-01 09:30:00+02	2025-08-01 10:00:00+02	qualityhairbolzano@gmail.com	2025-07-31 07:46:08.755+02	2025-07-31 09:36:07.677144+02	2025-07-31 09:36:07.677144+02	f	\N
04s74i3hqdlm21cafmu5cjhrd2	Johann Unterkofler tg	\N	\N	2025-08-01 08:45:00+02	2025-08-01 09:15:00+02	qualityhairbolzano@gmail.com	2025-07-31 07:47:34.779+02	2025-07-30 10:45:51.093092+02	2025-07-31 09:36:07.681324+02	f	\N
433b57dgdltn6mptvuihprg39e	Domenico Ghirardini tg	\N	\N	2025-08-01 10:30:00+02	2025-08-01 11:00:00+02	qualityhairbolzano@gmail.com	2025-07-31 08:40:52.995+02	2025-07-31 09:36:07.683118+02	2025-07-31 09:36:07.683118+02	f	7
1s63m32okb2fhl2pai5ibjnrh7	Loredana Gobbetti P	\N	\N	2025-08-07 15:00:00+02	2025-08-07 15:30:00+02	qualityhairbolzano@gmail.com	2025-07-31 08:45:16.738+02	2025-07-31 09:36:07.684745+02	2025-07-31 09:36:07.684745+02	f	\N
63j7l5ump2q2f9b2v5p0pk95pa	giancarlo nerini tg	\N	\N	2025-08-01 10:00:00+02	2025-08-01 10:30:00+02	tlpebaby2000@gmail.com	2025-07-31 10:01:13.369+02	2025-07-31 10:09:30.172845+02	2025-07-31 10:09:30.172845+02	f	7
7plod8bmb331r3d1sg32ku95mn	Lukas Döcker tg barba	\N	\N	2025-07-31 18:00:00+02	2025-07-31 19:00:00+02	sandro.stefanati@gmail.com	2025-07-31 10:48:13.732+02	2025-07-31 10:54:30.346631+02	2025-07-31 10:54:30.346631+02	f	\N
66u8ah09vccum8q368rtock0ud	Mauro Stoffella tg	\N	\N	2025-08-01 15:00:00+02	2025-08-01 15:30:00+02	sandro.stefanati@gmail.com	2025-07-31 11:28:36.729+02	2025-07-31 11:38:32.971756+02	2025-07-31 11:38:32.971756+02	f	\N
6cv7t6f8p4fu1nit5la30ohb3h	marco ferrari tg	\N	\N	2025-07-31 13:30:00+02	2025-07-31 14:00:00+02	qualityhairbolzano@gmail.com	2025-07-31 12:01:51.319+02	2025-07-31 12:11:31.890764+02	2025-07-31 12:11:31.890764+02	f	7
4qp8m6jslt0dks8njd2i84k8ro	Hugo Diblasi tg	\N	\N	2025-08-02 13:30:00+02	2025-08-02 14:00:00+02	sandro.stefanati@gmail.com	2025-07-31 17:47:51.061+02	2025-08-01 11:10:32.399803+02	2025-08-01 11:10:32.399803+02	f	\N
4mrj3f8876kqu98i5kml8ftgai	brugioli franco tg	\N	\N	2025-08-01 14:15:00+02	2025-08-01 14:45:00+02	tlpebaby2000@gmail.com	2025-07-31 18:18:34.607+02	2025-08-01 11:10:32.417118+02	2025-08-01 11:10:32.417118+02	f	7
3b7fb7t5tf8m6a2ks367la308a	Marisa Vecchi tg	\N	\N	2025-08-01 11:30:00+02	2025-08-01 12:00:00+02	sandro.stefanati@gmail.com	2025-08-01 08:47:51.023+02	2025-08-01 11:10:32.421429+02	2025-08-01 11:10:32.421429+02	f	\N
34gl7rhts158a37ba03o08thpj	Astrid Deluca P	\N	\N	2025-08-02 14:00:00+02	2025-08-02 14:30:00+02	qualityhairbolzano@gmail.com	2025-08-01 11:18:58.315+02	2025-08-01 11:25:32.978249+02	2025-08-01 11:25:32.978249+02	f	\N
5e4e2kai4giuc7am4qhs27tj7i	no Tino	\N	\N	2025-08-19 00:00:00+02	2025-08-24 00:00:00+02	sandro.stefanati@gmail.com	2025-08-01 12:08:10.862+02	2025-08-01 12:10:33.241607+02	2025-08-01 12:10:33.241607+02	t	7
0uu35u9uj46himh89vn0dqcpel	Stefano Pesce perm tg barba	\N	\N	2025-08-01 16:15:00+02	2025-08-01 18:15:00+02	qualityhairbolzano@gmail.com	2025-08-01 15:46:45.955+02	2025-07-29 17:06:29.481478+02	2025-08-01 15:59:01.100141+02	f	\N
cop68cr571h3gbb36crjab9kcphmcbb1ccr30b9h6or6cc1gckp3copm6s	Anto p	\N	\N	2025-08-02 15:30:00+02	2025-08-02 16:15:00+02	qualityhairbolzano@gmail.com	2025-08-01 19:36:25.569+02	2025-08-02 08:17:48.54063+02	2025-08-02 08:17:48.54063+02	f	\N
5lo214pl8bg3m1f4jifa3157vd	Daniela Ketmaier tratt 	\N	\N	2025-08-02 10:00:00+02	2025-08-02 11:00:00+02	qualityhairbolzano@gmail.com	2025-08-02 10:42:16.881+02	2025-07-29 14:51:24.428267+02	2025-08-02 10:48:20.444177+02	f	\N
4ieeaqn8ecnpgao0vuv2nm617o	ennio ambrosi tg	\N	\N	2025-08-09 11:00:00+02	2025-08-09 11:30:00+02	qualityhairbolzano@gmail.com	2025-08-02 11:20:19.84+02	2025-08-02 11:29:29.396319+02	2025-08-02 11:29:29.396319+02	f	7
5p4paomf9nvofmlk5qpttp5qg6	Vito tg	\N	\N	2025-08-30 12:30:00+02	2025-08-30 13:00:00+02	qualityhairbolzano@gmail.com	2025-08-02 12:51:25.263+02	2025-08-02 13:02:08.906565+02	2025-08-02 13:02:08.906565+02	f	\N
02bb5skcqume7m27sb0i0lo9md	Patty p	\N	\N	2025-08-30 12:00:00+02	2025-08-30 12:30:00+02	qualityhairbolzano@gmail.com	2025-08-02 12:51:35.864+02	2025-08-02 13:02:08.907969+02	2025-08-02 13:02:08.907969+02	f	\N
2skih711c6j87grqc17ubefu96	Fabrizio Ghirardini tg	\N	\N	2025-08-06 17:00:00+02	2025-08-06 17:30:00+02	sandro.stefanati@gmail.com	2025-08-02 15:17:55.616+02	2025-08-02 08:17:48.187547+02	2025-08-02 15:26:34.072951+02	f	\N
70o34d1g60s62b9j6tgm2b9k6dj62bb1chj34b9h6lh6ac3668rjidpnc8	Luca Fabbro tg	\N	\N	2025-08-06 15:00:00+02	2025-08-06 15:30:00+02	qualityhairbolzano@gmail.com	2025-08-04 09:33:14.098+02	2025-08-05 08:28:19.441714+02	2025-08-05 08:28:19.441714+02	f	\N
7mh0updr0aj48umdc6grqakaj1	Moreno Miglioranza tg	\N	\N	2025-08-05 18:00:00+02	2025-08-05 18:30:00+02	qualityhairbolzano@gmail.com	2025-08-05 08:45:04.969+02	2025-08-05 08:58:20.048614+02	2025-08-05 08:58:20.048614+02	f	\N
2pl582nl3jvgk5dmc25req4ks9	Michele Piccoli tg	\N	\N	2025-08-06 18:00:00+02	2025-08-06 18:30:00+02	sandro.stefanati@gmail.com	2025-08-05 12:56:49.287+02	2025-08-05 08:58:20.054398+02	2025-08-05 15:17:58.530186+02	f	\N
17209089ua110mjkliq29u6mba	Mario Abram tg	\N	\N	2025-08-07 09:00:00+02	2025-08-07 09:45:00+02	sandro.stefanati@gmail.com	2025-08-05 16:58:05.081+02	2025-08-05 10:00:44.412929+02	2025-08-05 17:04:43.765258+02	f	\N
6cq36c336lh34bb1chim4b9k6lj62b9ochijeb9jc4qm2ohgc4o68c33ck	Dimitri Rampulla tg	\N	\N	2025-08-08 16:00:00+02	2025-08-08 16:30:00+02	qualityhairbolzano@gmail.com	2025-08-05 17:09:07.614+02	2025-08-05 08:28:19.42422+02	2025-08-05 18:32:24.998418+02	f	\N
1dkhdke623sb88v7fukh00e39n	daria tn	\N	\N	2025-08-07 13:00:00+02	2025-08-07 15:00:00+02	tlpebaby2000@gmail.com	2025-08-07 15:03:12.42+02	2025-08-02 15:41:33.776381+02	2025-08-07 15:07:01.383288+02	f	7
6ge0ru3839d8tprvs6rlvmkgof	Vito Pul	\N	\N	2025-08-09 12:00:00+02	2025-08-09 12:30:00+02	qualityhairbolzano@gmail.com	2025-08-07 17:42:13.427+02	2025-08-02 13:02:08.904908+02	2025-08-07 17:52:41.175405+02	f	\N
6lhj0cr4clhj4b9l74r3ib9k6th6cbb175hm6bb16tgjccj460sjeeb674	Sara Bodecchi tg	\N	\N	2025-08-08 12:30:00+02	2025-08-08 13:15:00+02	qualityhairbolzano@gmail.com	2025-08-08 13:02:58.739+02	2025-08-05 08:28:19.439591+02	2025-08-08 13:04:08.586131+02	f	\N
2lu4chl6mj0abfu8f8svce85nv	Flavio Pasquali tg	\N	\N	2025-08-06 16:00:00+02	2025-08-06 16:30:00+02	qualityhairbolzano@gmail.com	2025-08-05 09:43:46.152+02	2025-08-05 10:00:44.419605+02	2025-08-05 10:00:44.419605+02	f	\N
082gjjvv8mq8vp8ntj2tg8qq0s	Sandrone Arnese tg	\N	\N	2025-08-08 15:00:00+02	2025-08-08 15:30:00+02	sandro.stefanati@gmail.com	2025-08-05 11:20:00.069+02	2025-08-05 15:17:58.524881+02	2025-08-05 15:17:58.524881+02	f	\N
ckr6aopp65hm8b9i6hi3ib9kcoqm8b9p60o38b9ncoq38cpn68sj8e9p68	Federico Ghirardini tg	\N	\N	2025-08-21 17:00:00+02	2025-08-21 17:30:00+02	qualityhairbolzano@gmail.com	2025-08-05 14:03:59.618+02	2025-08-05 15:17:58.533099+02	2025-08-05 15:17:58.533099+02	f	\N
0q4pe72neijgfcf3a4oi0fkp60	Roberto Brugiatelli tg	\N	\N	2025-08-14 10:00:00+02	2025-08-14 10:30:00+02	sandro.stefanati@gmail.com	2025-08-05 15:48:34.738+02	2025-08-05 15:49:57.3163+02	2025-08-05 15:49:57.3163+02	f	\N
7b539915ductstotc88g85kqsc	Andrea Vaccaro tg	\N	\N	2025-08-07 16:30:00+02	2025-08-07 17:15:00+02	sandro.stefanati@gmail.com	2025-08-05 17:44:36.453+02	2025-08-05 15:17:58.527738+02	2025-08-05 18:32:25.007775+02	f	\N
58pkp40949pbdcb1fv99khf4ob	Alessandro Gozzi tg barba	\N	\N	2025-08-09 10:30:00+02	2025-08-09 11:30:00+02	sandro.stefanati@gmail.com	2025-08-05 17:49:30.009+02	2025-08-05 18:32:25.016275+02	2025-08-05 18:32:25.016275+02	f	\N
49vivn7b4i9rkf65vdnu94uok6	Lucky Casa	\N	\N	2025-08-13 18:45:00+02	2025-08-13 19:30:00+02	sandro.stefanati@gmail.com	2025-08-06 08:54:12.407+02	2025-08-06 09:41:09.428041+02	2025-08-06 09:41:09.428041+02	f	\N
7unpq28vbl9fnn52u2al1l7gqo	Margit Pfeifer (Sister) tn+tg	\N	\N	2025-08-14 14:30:00+02	2025-08-14 16:30:00+02	tlpebaby2000@gmail.com	2025-08-06 15:41:44.315+02	2025-08-06 15:40:04.894324+02	2025-08-06 15:55:05.089381+02	f	\N
2m22khf04a9of0eoauog23jtd7	marinaro enrico tg	\N	\N	2025-08-07 11:15:00+02	2025-08-07 11:45:00+02	tlpebaby2000@gmail.com	2025-08-06 16:38:53.241+02	2025-08-06 16:40:04.911647+02	2025-08-06 16:40:04.911647+02	f	7
0po8j9cauh2m0gpvl8ik58irmj	Maria Rosca tg	\N	\N	2025-08-06 16:15:00+02	2025-08-06 16:45:00+02	sandro.stefanati@gmail.com	2025-08-06 16:46:32.277+02	2025-08-05 15:17:58.514313+02	2025-08-06 16:55:05.167008+02	f	\N
5revt2vbbuk2kk8brnvm6bj10p	roberto pagliarin tg	\N	\N	2025-08-06 17:45:00+02	2025-08-06 18:15:00+02	tlpebaby2000@gmail.com	2025-08-06 17:16:40.012+02	2025-08-06 17:25:04.975147+02	2025-08-06 17:25:04.975147+02	f	7
4fkjkpmfei949h4h48ru0idq6t	Vincenzo Carpinelli tg barba	\N	\N	2025-08-08 13:30:00+02	2025-08-08 14:30:00+02	sandro.stefanati@gmail.com	2025-08-07 08:46:35.884+02	2025-08-07 08:53:25.129851+02	2025-08-07 08:53:25.129851+02	f	\N
3v1fvejdhgrflurna346sek7jh	paganini luigi tg	\N	\N	2025-08-08 11:00:00+02	2025-08-08 11:30:00+02	tlpebaby2000@gmail.com	2025-08-07 10:44:29.257+02	2025-08-07 10:46:30.884795+02	2025-08-07 10:46:30.884795+02	f	7
10hesqmeh2pn9l7ejvkc31fg6j	Loredana Gobbetti tn	\N	\N	2025-08-14 08:00:00+02	2025-08-14 10:00:00+02	qualityhairbolzano@gmail.com	2025-08-07 15:01:53.809+02	2025-08-07 15:07:01.331625+02	2025-08-07 15:07:01.331625+02	f	\N
4spfkssrh901qldp5ut9uc6gml	caliari franco tg	\N	\N	2025-08-07 16:30:00+02	2025-08-07 17:00:00+02	tlpebaby2000@gmail.com	2025-08-07 16:02:40+02	2025-08-07 16:03:46.720269+02	2025-08-07 16:03:46.720269+02	f	7
05sm7iu5suubk2pqmras1iohmf	Roberto Lescio tg	\N	\N	2025-08-07 17:15:00+02	2025-08-07 17:45:00+02	qualityhairbolzano@gmail.com	2025-08-07 17:06:40.299+02	2025-08-05 16:49:43.14666+02	2025-08-07 17:52:41.163841+02	f	\N
6p57sj1qr51ktg6pka4iiburs3	Patty P	\N	\N	2025-08-12 09:00:00+02	2025-08-12 09:30:00+02	sandro.stefanati@gmail.com	2025-08-07 17:42:45.698+02	2025-08-07 17:52:41.17773+02	2025-08-07 17:52:41.17773+02	f	\N
1gvf1d6bfetegof9lf013tauil	Miki Lintner tg	\N	\N	2025-08-07 18:00:00+02	2025-08-07 18:30:00+02	sandro.stefanati@gmail.com	2025-08-07 18:04:53.062+02	2025-08-05 18:32:25.010945+02	2025-08-07 18:07:41.744244+02	f	\N
2f4kj4akptr96tao1ncfn6qh4f	Luca Ianeselli barba	\N	\N	2025-08-21 12:30:00+02	2025-08-21 13:00:00+02	qualityhairbolzano@gmail.com	2025-08-07 22:42:42.911+02	2025-08-07 13:26:45.15244+02	2025-08-08 08:24:42.082834+02	f	\N
5419plpanmgtl9fadvc6586mor	Nicola Moscon tg	\N	\N	2025-08-13 08:45:00+02	2025-08-13 09:15:00+02	qualityhairbolzano@gmail.com	2025-08-08 08:27:12.213+02	2025-08-08 08:39:42.923825+02	2025-08-08 08:39:42.923825+02	f	\N
6sr3ic356op3cb9hc5hjab9k74q36bb16dhmcbb4ckpj6d9pcgs68phlcg	Roland Ausserer flash tg	\N	\N	2025-08-08 08:45:00+02	2025-08-08 09:15:00+02	qualityhairbolzano@gmail.com	2025-08-08 09:31:48.063+02	2025-08-06 08:17:25.982738+02	2025-08-08 11:41:39.843063+02	f	\N
35cptoc1s1keetk7cq0aqis1b8	Giuliano Pandolfi tg	\N	\N	2025-08-08 09:15:00+02	2025-08-08 09:45:00+02	qualityhairbolzano@gmail.com	2025-08-08 09:31:51.489+02	2025-08-07 09:08:25.826857+02	2025-08-08 11:41:39.849129+02	f	\N
59s6u2vl1qcqna6p2pll7armnr	Giancarlo Gabbanella tg	\N	\N	2025-08-09 14:00:00+02	2025-08-09 14:30:00+02	qualityhairbolzano@gmail.com	2025-08-08 10:54:45.458+02	2025-08-08 11:41:39.872132+02	2025-08-08 11:41:39.872132+02	f	\N
05b3f0cqkfd0jgugsjnrrakejm	Marisa Giovanazzi tn tg	\N	\N	2025-08-08 10:00:00+02	2025-08-08 11:30:00+02	sandro.stefanati@gmail.com	2025-08-08 11:26:52.678+02	2025-08-06 10:07:10.948811+02	2025-08-08 11:41:39.875445+02	f	\N
0qanlrl0vkkvl6ec02b1k2vcq7	Giorgio Pregnolato tg	\N	\N	2025-08-12 10:00:00+02	2025-08-12 10:30:00+02	qualityhairbolzano@gmail.com	2025-08-08 12:08:37.56+02	2025-08-08 12:11:40.49176+02	2025-08-08 12:11:40.49176+02	f	\N
720uubtgb7gftd583elavrmab6	Sonia Fontana tn + taglio	\N	\N	2025-09-13 08:30:00+02	2025-09-13 10:30:00+02	qualityhairbolzano@gmail.com	2025-08-09 10:19:36.261+02	2025-08-09 12:17:18.207529+02	2025-08-09 12:17:18.207529+02	f	\N
4jqvrt6f32469pnm9p3jvqmn44	Paola Tonolli tn tg	\N	\N	2025-08-27 08:30:00+02	2025-08-27 10:30:00+02	qualityhairbolzano@gmail.com	2025-08-09 10:31:13.467+02	2025-08-09 12:17:18.261567+02	2025-08-09 12:17:18.261567+02	f	\N
71pqc6k803l6ptovq7v2evmv54	ennio ambrosi	\N	\N	2025-08-16 11:00:00+02	2025-08-16 11:30:00+02	qualityhairbolzano@gmail.com	2025-08-09 11:34:45.372+02	2025-08-09 12:17:18.263948+02	2025-08-09 12:17:18.263948+02	f	\N
1p02mkapbe2hmsl65hjs1n4ts3	Vito pul	\N	\N	2025-08-12 09:30:00+02	2025-08-12 10:00:00+02	qualityhairbolzano@gmail.com	2025-08-09 11:57:37.49+02	2025-08-09 12:17:18.267521+02	2025-08-09 12:17:18.267521+02	f	\N
30u6ams6soctd00blcf311p397	Paola Zimmermann tn tg	\N	\N	2025-08-16 12:00:00+02	2025-08-16 14:00:00+02	sandro.stefanati@gmail.com	2025-08-09 12:10:25.28+02	2025-08-09 12:17:18.33851+02	2025-08-09 12:17:18.33851+02	f	\N
7c20h9guk4np878f3v90qd4nfd	Claudio Zimmermann tg	\N	\N	2025-08-16 12:15:00+02	2025-08-16 12:45:00+02	sandro.stefanati@gmail.com	2025-08-09 12:11:06.49+02	2025-08-09 12:17:18.341801+02	2025-08-09 12:17:18.341801+02	f	\N
\.


--
-- Data for Name: client_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_photos (id, cliente_id, file_path, didascalia, created_at, tags) FROM stdin;
21	18	/uploads/df02d1ab8faff6b9529074aee959214b.jpg	colore	2025-08-05 16:01:06.629307+02	{"Biondo ramato"}
20	18	/uploads/6b87f04f4b84b7852412ed2519207204.png	colore	2025-08-05 16:00:26.262404+02	{rame}
33	18	/uploads/02d3fb9f79fc5e8be81bb90064482260.jpg	colore	2025-08-06 11:41:21.114093+02	{"balajage caramello"}
50	251	/uploads/45d057e9258b1be64457226da4940206.jpg	barba	2025-08-08 14:28:34.830711+02	{"impacco caldo/freddo"}
51	251	/uploads/20acd947444535bc35ec97a63d4e6382.jpg	barba	2025-08-08 15:12:44.346299+02	{"impacco caldo / freddo"}
25	130	/uploads/51e0455343ab36ea55cb6c8585037221.jpg	taglio	2025-08-05 16:10:35.317845+02	{razor,"riga marcata"}
24	199	/uploads/f968580e2f6b07c53fd6e21a8a6b2c01.jpg	taglio	2025-08-05 16:08:10.486572+02	{"spazzola quadrata"}
23	199	/uploads/18b2e69f20a1c73dbd7868ea6f377740.jpg	taglio	2025-08-05 16:07:56.189466+02	{"spazzola quadrata"}
52	38	/uploads/15fac1f66a1e98192147e55f0af9d94d.jpg	taglio	2025-08-08 15:13:42.233222+02	{"spazzola quadrata"}
19	115	/uploads/afc66823493c61ffa7fa1baf4ff8532c.jpg	taglio	2025-08-05 15:56:23.866313+02	{tattoo}
18	115	/uploads/397fe8e636cfb543cc0ab91a89e05876.jpg	taglio	2025-08-05 15:43:37.130805+02	{tattoo}
17	115	/uploads/0564efd3f9c0dc8d6686441ddb752878.jpg	taglio	2025-08-05 15:43:01.107905+02	{tattoo}
16	115	/uploads/a42007ca7a21c4aed88924f90c8d5731.jpg	taglio	2025-08-05 15:41:54.697841+02	{tattoo}
15	115	/uploads/1400499434ce746668c7a3c8ceb7f9e0.jpg	taglio	2025-08-05 15:40:59.765694+02	{tattoo}
13	115	/uploads/745bb318840cc193b871312a71baa106.jpg	taglio	2025-08-05 15:39:54.07009+02	{tattoo}
53	38	/uploads/e46d4cdfd16041cd3bbc643fc36735c3.jpg	taglio	2025-08-08 15:14:02.736879+02	{"spazzola quadrata"}
54	38	/uploads/bfc80bbbb79c7745dfa43f3494d9cd06.jpg	profilo	2025-08-08 15:14:24.547699+02	{profilo}
56	523	/uploads/8b7eaad96359da01310ea830bf5a8061.jpg	taglio	2025-08-08 17:16:25.565961+02	{razor}
57	523	/uploads/f5627628307e30661132abb3dbfb1760.jpg	taglio	2025-08-08 17:16:42.396213+02	{razor}
36	56	/uploads/3d1a29efb3a384c9e89b0144da115fb9.jpg	taglio	2025-08-06 15:34:51.165291+02	{razor,curl}
55	523	/uploads/773deae1d786ddadab9494dff575dd1e.jpg	taglio	2025-08-08 17:16:03.693094+02	{profilo,razor}
39	525	/uploads/080fb8f66d40d9cb24fae332b8202036.jpg	prima del tratt 07-08-2025	2025-08-07 11:01:38.978832+02	{_trico,ipercheratosi}
11	278	/uploads/b5af3e7c8ec19ef975801d49b0d2612b.jpg	permanente	2025-08-05 15:37:46.193756+02	{permanente,curl}
40	115	/uploads/a744fe82405fa091b15f40f03a9e378b.jpg	taglio	2025-08-07 15:17:55.491174+02	{razor,tattoo}
41	115	/uploads/d9e541a6f3e9762f9c2f58d1f46e9612.jpg	foto profilo	2025-08-07 15:18:47.860853+02	{profilo}
35	525	/uploads/f08248de9f4461ab304ace336c9b6c3d.jpg	foto profilo	2025-08-06 14:43:39.663073+02	{profilo}
34	18	/uploads/838b887b1ccd30e1b1dbbb41b793d8a8.jpg	colore	2025-08-06 11:41:57.005559+02	{"balajage oro",profilo}
26	81	/uploads/afae69d7b24b4babe6ccd9c2ce91d9b0.jpg	taglio	2025-08-05 16:12:00.679459+02	{razor,profilo}
22	199	/uploads/dac58f6e26e5fb58ebf9be17f2298f29.jpg	taglio	2025-08-05 16:07:34.022414+02	{"spazzola quadrata",profilo}
12	278	/uploads/e90495ba4ff4d023e1367e8f185fb78c.jpg	permanente	2025-08-05 15:38:15.274506+02	{profilo,permanente,curl}
38	56	/uploads/2ac91dc0f488e34d630f6af8a32157e4.jpg	taglio	2025-08-06 15:35:30.960996+02	{profilo,razor,curl}
43	126	/uploads/bf791c05d9b55fa6a209a75036b6c3b2.jpg	Taglio, colore	2025-08-08 12:21:25.879342+02	{"biondo sabbia"}
44	126	/uploads/850a935cc822b867dc25c31b10347bbb.jpg	Taglio, colore	2025-08-08 12:21:56.596328+02	{profilo,"biondo sabbia"}
45	17	/uploads/8a0ec1b9ab3076a9c04c0a904b61ebe6.jpg	profilo	2025-08-08 13:05:51.828788+02	{profilo}
46	17	/uploads/61d4d101510aba5545227c1c61d6ef7f.jpg	taglio	2025-08-08 13:06:18.689986+02	{"solo punte"}
47	251	/uploads/b9b275a20fc3b006b29902ef2ca3e81d.jpg	Taglio	2025-08-08 14:27:25.335778+02	{"doppia sfumatura",curl}
48	251	/uploads/5f0e2f3db21cb116b827355659cd5395.jpg	profilo	2025-08-08 14:27:46.643755+02	{profilo}
49	251	/uploads/9290b87ca7db52c5560a6f7b68d17897.jpg	taglio	2025-08-08 14:28:14.056842+02	{"doppia sfumatura",curl}
58	333	/uploads/34709758ca0d60fbd56c94cf0f819f27.jpg	profilo, colore	2025-08-09 12:18:37.895031+02	{profilo,cioccolato}
\.


--
-- Data for Name: clienti; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clienti (id, nome, cognome, telefono, email, preferenze_note, storico_acquisti, data_nascita, soprannome, tags) FROM stdin;
21	andreas	Untersulzner	0472284109		\N	\N	\N	\N	{}
23	gianluca	Giovannini	3485926175	gianlucabz@libero.it	\N	\N	\N	\N	{}
25	Giancarlo	Nerini	3388749298		\N	\N	\N	\N	{}
27	pietro	marchioro	347-4404520		\N	\N	\N	\N	{}
28	romano	riccadonna	3296494139		\N	\N	\N	\N	{}
29	Fausto	Martellozzo	335264800	fausto.martellozzo@gmail.com	\N	\N	\N	\N	{}
32	Franco	Brugioli	339-5629885	rospac@gmail.com	\N	\N	\N	\N	{}
34	gunter	Costa	335-6080015	info@costa.bz.it	\N	\N	\N	\N	{}
36	Ernesto	Coppola	328-1093450		\N	\N	\N	\N	{}
37	Gianni	Emanuelli	0471-271613	gianni.luisa.bz@virgilio.it	\N	\N	\N	\N	{}
40	andrea	chiusole	0471-920705		\N	\N	\N	\N	{}
42	Luca	Borgogno	348-7002525	l.borgogno@commerprint.it	\N	\N	\N	\N	{}
43	marco	ferrari	349-4598155	marco@vendruscolo.it	\N	\N	\N	\N	{}
44	Andrea	Tioli	3293878293	andrea.tioli@gmail.com	\N	\N	\N	\N	{}
45	vigl	wilhelm	0471-930762		\N	\N	\N	\N	{}
48	Sigfried	Putzer	3492229881		\N	\N	\N	\N	{}
50	luciano	Struffi	3880645011		\N	\N	\N	\N	{}
52	Bruno	Concin	3383856718		\N	\N	\N	\N	{}
53	Paolo	Bertolini	3356043974	paolobertolini59@gmail.com	\N	\N	\N	\N	{}
55	leonhard	patzleiner	340-9723971		\N	\N	\N	\N	{}
57	bruno	girolimon	393-7132912		\N	\N	\N	\N	{}
58	Andrea	Fabbro	3343937075	andreafabbro16@gmail.com	\N	\N	\N	\N	{}
59	robert	auer	0471-930025		\N	\N	\N	\N	{}
60	Luigi	Giordani	3395061906	luigi.giordani@edyna.net	\N	\N	\N	\N	{}
61	alberto	motter	328-3878738		\N	\N	\N	\N	{}
62	rocco	furgiuele	333-6650512		\N	\N	\N	\N	{}
63	Mirco	Giordani	3347717116	mircogiordani46@gmail.com	\N	\N	\N	\N	{}
64	Roberto	Brugiatelli	3477557756		\N	\N	\N	\N	{}
65	edi	pichler	348-7702555		\N	\N	\N	\N	{}
69	nikolaus	brunner	333-5784269	nokolaus.brunner@hotmail.com	\N	\N	\N	\N	{}
70	Milena	Pansera	3356027326		\N	\N	\N	\N	{}
71	mario	marini	347-1253110		\N	\N	\N	\N	{}
72	Livio	Ruvioatti	3398331816		\N	\N	\N	\N	{}
73	Luciano	Riccadonna	3486450378		\N	\N	\N	\N	{}
74	roland	erardi	0039-3441301894	roland.erardi@alice.it	\N	\N	\N	\N	{}
75	Fabio	Gattolin	3384733883	fabio.gattolin@virgilio.it	\N	\N	\N	\N	{}
77	Giuliano	Pandolfi	3339075111	giuliano.claudia@alice.it	\N	\N	\N	\N	{}
79	ruggero	rossi demio	3333568198	rrossidemio@gmail.com	\N	\N	\N	\N	{}
80	valentino	divina	3319877685		\N	\N	\N	\N	{}
82	adolfo	gallo	347-3496230	adolfo.gallo@alice.it	\N	\N	\N	\N	{}
83	Alice Barbara	Tomasi	0471285328		\N	\N	\N	\N	{}
84	giacomino	milani	0471 271528		\N	\N	\N	\N	{}
88	flavio	merlante	329-0079334	flaviomerlante@inwind.it	\N	\N	\N	\N	{}
89	luigi	perini	3394851443		\N	\N	\N	\N	{}
90	Margherita	Crstoforetti	3281478841		\N	\N	\N	\N	{}
91	Roberto	lescio	3477703382	roberto.lescio@gmail.com	\N	\N	\N	\N	{}
92	luca	ceccoli	3665405350	mister.lc98@gmail.com	\N	\N	\N	\N	{}
93	paolo	ceccoli	3357567398	paoloceccoli.pc@gmail.com	\N	\N	\N	\N	{}
94	Dieter	Seifert	3482487457	dieter.sefert@athesia.it	\N	\N	\N	\N	{}
95	Vladimiro	Zanellati	335223345	vladimiro.zanellati@gmail.com	\N	\N	\N	\N	{}
96	bruno	boccagni	0471-272320		\N	\N	\N	\N	{}
97	Norbert	Kemenater	3382737125		\N	\N	\N	\N	{}
100	Alberto	Bresadola	0471264592	alberto.bresadola@virgilio.it	\N	\N	\N	\N	{}
101	Silvia	Estfeller	3481193612	estfeller.sylvia@gmail.com	\N	\N	\N	\N	{}
103	daniele	lione	339-8688583	daniele.lione@alice.it	\N	\N	\N	\N	{}
105	corrado	Bevilacqua	3484068551	corrado.bevilacqua@gmail.com	\N	\N	\N	\N	{}
106	andreas	ratschiller	334-3278043	andreasratschiller@outlook.com	\N	\N	\N	\N	{}
107	Benito	Zanoni	0471811340		\N	\N	\N	\N	{}
108	Michael	Steurer	3332974547	m.steurer@zozin.it	\N	\N	\N	\N	{}
111	Marco	Marangoni	3355370096	marcomarangoni1@virgilio.it	\N	\N	\N	\N	{}
112	sandro	rinaldi	348-4120096	sandro_rinaldi@katamail.com	\N	\N	\N	\N	{}
114	riccardo	scavazza	335-1206678	riccardo.scavazza@gmail .com	\N	\N	\N	\N	{}
116	andrea	santoro	328-7440642	santo.91@hotmail.it	\N	\N	\N	\N	{}
117	Diana	Rovigati	3470088904	rovigati@libero.it	\N	\N	\N	\N	{}
119	Federico	Ghirardini	3394893444	ghirardinifederico@outlook.com	\N	\N	\N	\N	{}
121	Massimo	Faggionato	3478001256	max.faggionato@yahoo.it	\N	\N	\N	\N	{}
122	Florian	Prast	3351379341		\N	\N	\N	\N	{}
123	massimo	luminoso	333-7148831	massimo.luminoso@virgilio.it	\N	\N	\N	\N	{}
104	Alessandro	Pasquali	3388726218	al65pass@libero.it	\N	\N	\N	Al	{}
56	Luca	Fabbro	3921031501	lucafabbro20@gmail.com	amico Andrea Vaccaro	\N	\N	\N	{}
67	Stefano	Romagnoli	339-6071531	s.r.romagnoli@outlook.it	\N	\N	\N	\N	{}
118	Claudio	Maccagnan	3357082822	claudio.maccagnan@gmail.com	\N	\N	\N	\N	{}
87	Stefano	Malatesta	333-5217930	stefano.claudia13687@gmail.com	Marito Claudia Zanettini	\N	\N	\N	{}
86	Claudia	Zanettini	3398018711	stefano.claudia13687@gmail.com	Moglie Stefano Malatesta	\N	\N	\N	{}
22	Nicola	Moscon	0471203652		\N	\N	\N	\N	{}
20	Hugo	DiBlasi	3480945880	hugo.di.blasi@gmail.com	Basket Rosa	\N	\N	\N	{}
26	Mario	Abram	3356882764		\N	\N	\N	\N	{}
31	Luca	Nalin	3932241260	luca.nalin.bz@gmail.com	\N	\N	\N	\N	{}
33	Paolo	Refatti	0471282806		\N	\N	\N	\N	{}
47	Francesco - Rodia -	Bettini	0471911758		\N	\N	\N	\N	{}
78	Lukas	Döcker	3922828103	doecker.lukas@gmail.it	\N	\N	\N	\N	{}
24	Alessandro	spiniella	348-6006209	a.spiniella@gmail.com	\N	\N	\N	\N	{}
113	Mariagrazia	Sporaore	3895036584		moglie Vincenzo Mammone	\N	\N	\N	{}
120	Francesco	Ingannamorte	0471 26432		\N	\N	\N	\N	{}
99	Vittorio	Brugiatelli	3338565424	vbrugia@gmail.com	\N	\N	\N	Kicco	{}
98	gianluigi	leocane	388-2282442		\N	\N	\N	Leo	{}
110	Domenico	Ghirardini	3481650065	ghirardinidomenico@me.com	\N	\N	\N	Ghiro	{}
35	Michele	Piccoli	3331598671	picmic141@gmail.com	\N	\N	\N	Miki	{amici}
54	Moreno	Miglioranza	3471529404	moreno.miglioranza@gmail.com	\N	\N	\N		{amici}
41	Stefano	Bruzzese	3384494689	stefano.bruzzese@vodafone.it	\N	\N	\N	Bruz	{amici}
81	Andrea	Vaccaro	3481270643	andrea.vaccaro96@gmail.com	amico dei Fabbro	\N	\N	\N	{}
38	Sandrone	Arnese	3396927313		\N	\N	\N	Sandrone	{amici}
124	Roberto	Barusco	3391273626	robi.bar62@gmail.com	\N	\N	\N	\N	{}
127	carlo	benetti	349-6156778		\N	\N	\N	\N	{}
128	renato	mott	0471-280045		\N	\N	\N	\N	{}
129	Paolo	Cassetti	3483734317	pierpaolo.cassetti@alice.it	\N	\N	\N	\N	{}
130	Alessandro Elia	Cassetti	3297531970	pierpaolo.cassetti@alice.it	\N	\N	\N	\N	{}
131	Maria	Rosca	3357122794	marrosshka@yahoo.com	\N	\N	\N	\N	{}
134	jasmine	meraner	345-9395954	jasmin.meranre@aol.com	\N	\N	\N	\N	{}
135	Flavio	Pasquali	3484408910	fla.pasquali@yahoo.it	\N	\N	\N	\N	{}
136	Fabian	Defan	3519961291	fwedmann@gmx.dom	\N	\N	\N	\N	{}
137	Alessandro	Steiner	3356380480	alessandro.steiner@sudio-datafin.it	\N	\N	\N	\N	{}
139	ezio	de mio	339-5971450	edemio@libero.it	\N	\N	\N	\N	{}
140	anna	cudemo	338-4051332		\N	\N	\N	\N	{}
141	Antonio	Gonzo	3475710885	antonio.gonzo@rolmail.net	\N	\N	\N	\N	{}
142	Romano	Beaco	3666432648	romano.beaco@ithesia.it	\N	\N	\N	\N	{}
143	Nevio	Gavioli	3331950688		\N	\N	\N	\N	{}
144	Amos	Bevilacqua	0471914162		\N	\N	\N	\N	{}
146	walter	morandi	339-6080293		\N	\N	\N	\N	{}
148	klaus	civegna	3355458103	k.civegna@gmail.com	\N	\N	\N	\N	{}
149	Florian	Seifert	3456718310		\N	\N	\N	\N	{}
151	mario	tauber	345-9183431		\N	\N	\N	\N	{}
152	Giovanni	Faccinelli	3348780966		\N	\N	\N	\N	{}
153	andrea	capone	3701337881	capon.andrea@tiscali.it	\N	\N	\N	\N	{}
154	Carlo	Ceccon	3358267697	carloceccon@alice.it	\N	\N	\N	\N	{}
155	Hans	Unterkofler	3319527931		\N	\N	\N	\N	{}
156	Enzo	Zecchinato	3288622880	ezecchinaato@alice.it	\N	\N	\N	\N	{}
157	mattias	wallnoefer	349-6439901		\N	\N	\N	\N	{}
158	Sergio	Bellutti	3495664553	sergio.bellutti@alice.it	\N	\N	\N	\N	{}
159	Luis	Enderle	0471950343	luisele@tiscali.it	\N	\N	\N	\N	{}
160	Renato	Zecchini	3357043918	studiozecchinibz@gmail.com	\N	\N	\N	\N	{}
161	enrico	marinaro	320-4362218	ernicomarinaro@virgilio.it	\N	\N	\N	\N	{}
162	Matteo	Piazza	3482316573	matteo.82.piazza@gmail.com	\N	\N	\N	\N	{}
163	Fabio	Dallapiazza	3474481666	fabio.dallapiazza.bolzano@gmail.com	\N	\N	\N	\N	{}
164	massimo	biasin	302-4393969	massimo.biasin@biasin.it	\N	\N	\N	\N	{}
165	Giampy	Sartin	3313204937	giampaolo.sartin@gmail.com	\N	\N	\N	\N	{}
166	leonardo	tommasi	0471-285328		\N	\N	\N	\N	{}
167	Thomas	Fleschmann	3926190816	fleischthomas@gmail.com	\N	\N	\N	\N	{}
168	Enzo	Rubbo	3899731637	seposso@gmail.com	\N	\N	\N	\N	{}
169	luigi	bergamo	334-7358914		\N	\N	\N	\N	{}
170	Simone	Miglioranza	3883705732	miglioranzasimone3@gmail.com	\N	\N	\N	\N	{}
171	Giorgio	Storti	3384436486	storti.giorgio@gmail.com	\N	\N	\N	\N	{}
172	Carlo	Piccoli	0471288905		\N	\N	\N	\N	{}
173	Andrea	Baruffaldi	0471238003	baruffaldiandrea@alice.it	\N	\N	\N	\N	{}
174	gianclaudio	gaglianese	339-2908880	g.gaglianese@virgilio.it	\N	\N	\N	\N	{}
175	Ermenegildo	Guarise	3492362413		\N	\N	\N	\N	{}
176	roberto	Lazzarotto	3476823624	robylazz@hotmail.com	\N	\N	\N	\N	{}
177	giancarlo	carlotto	0471-252129		\N	\N	\N	\N	{}
178	Manuela	Pierotti	3311716763	manuela.pierotti@gmail.com	\N	\N	\N	\N	{}
180	rodolfo	hudoric	339-4210139		\N	\N	\N	\N	{}
181	Mauro	Trevisan	3497434338	mauro.trevisan1973@gmail.com	\N	\N	\N	\N	{}
182	Gabriele	Corea	3346371045	gabriele.corea@gmail.com	\N	\N	\N	\N	{}
185	Claudio	Bosio	3475680055	claudio.bosio@icluod.com	\N	\N	\N	\N	{}
186	Matthias	Andolfo	3663647311	matthiasandolfo@gmail.com	\N	\N	\N	\N	{}
187	arrigo	simoni	3482702371	arrigo.simoni@gmail.com	\N	\N	\N	\N	{}
189	Isabella	Todesco	3470084060	isabella.todesco@libero.it	\N	\N	\N	\N	{}
190	giovanni	leita	3483710779	giovanni.leita@wobi.bz.it	\N	\N	\N	\N	{}
191	Manfred	Wieser	3398654924	manniwmanni@gmail.com	\N	\N	\N	\N	{}
193	Oxana	Stepina	3443490316		\N	\N	\N	\N	{}
194	Tiziano	Campioni	3480047518	tiziano.campioni@gmail.com	\N	\N	\N	\N	{}
196	Barbara	Scola	3898022782	scola1423@gmail.com	\N	\N	\N	\N	{}
200	vittoria	tarascio	3277171900	tarsciovittoria@gmail.com	\N	\N	\N	\N	{}
201	Livio	Domenici	0471282824		\N	\N	\N	\N	{}
202	Gualtiero	Cantini	0471910769		\N	\N	\N	\N	{}
203	Alberto	Boffo	3388393624	a_boffo@hotmail.com	\N	\N	\N	\N	{}
204	antonio	tribenga	3483662570		\N	\N	\N	\N	{}
205	patrick	wieser	3382310000	patrickwwe@outlook.de	\N	\N	\N	\N	{}
206	Ivo	Tasca	3382620192	ivotasca@yahoo.it	\N	\N	\N	\N	{}
207	mauro	manzo	3474786123		\N	\N	\N	\N	{}
208	Marco	Santuliana	3493252281	santuliana70@gmail.com	\N	\N	\N	\N	{}
209	Vinicio	Bazzanella	0471262020	vinicio.bazzanella@libero.it	\N	\N	\N	\N	{}
211	Gianfranco	Minotti	3482341657	gianmino56@gmail.com	\N	\N	\N	\N	{}
212	andreas	huber	3480007071	andihuber68@hotmail.com	\N	\N	\N	\N	{}
213	Ida	Reich	3487354412		\N	\N	\N	\N	{}
214	Marisa	Vecchi	0471286338		\N	\N	\N	\N	{}
215	Giorgio	Barbieri	0471281531	giorgiobarbieri4@virgilio.it	\N	\N	\N	\N	{}
217	Michele	Feltrinelli	3488431265	michelonef76@yahoo.it	\N	\N	\N	\N	{}
218	hanz	tschenett	3356325995		\N	\N	\N	\N	{}
219	Mauro	Stoffella	3357522480	mstoffella@.it	\N	\N	\N	\N	{}
220	Hugo	Stoffella	3357555370	hugo.daniel.stoffella@gmail.com	\N	\N	\N	\N	{}
221	sante	pivetta	336853841		\N	\N	\N	\N	{}
222	Verena	Maier	0471281030		\N	\N	\N	\N	{}
223	Simone	DeGiacinto	3492688032	simonedegiacinto@gmail.com	\N	\N	\N	\N	{}
224	andrea	berni	3336680195	andreaberni88@hotmail.com	\N	\N	\N	\N	{}
225	ugo	Chimetto	3299889477		\N	\N	\N	\N	{}
226	Franz	Gasser	3351309869		\N	\N	\N	\N	{}
227	walter	segafredo	3286845451		\N	\N	\N	\N	{}
192	Mariarosa	Serafini	338 5888994	maryser964@gmail.com	\N	\N	\N	\N	{}
150	Stefan	Varesco	3334929215		\N	[{"prodotto":"quality after shave","data":"2025-04-30","prezzo":19,"quantita":1,"note":""}]	\N	\N	{}
132	Patrizia	Franchin	3356590697		moglie Vito	\N	\N	Patty	{}
126	Marisa	Giovanazzi	3343223557		Moglie Gianni Campagnoli	\N	\N	\N	{}
210	Roberto	Frenademez	3492821075	robfrenademez@hotmail.com	\N	\N	\N	\N	{}
179	Giorgia	Arman	3286950388	giorgia_arman@hotmail.com	piega 10	\N	\N	\N	{}
145	Margareth	Gasser	3407280432	lebonta.bz@gmail.com	\N	\N	\N	\N	{}
195	Thomas	Steigruber	3490714791	thomas.steigruber@gmail.com	\N	\N	\N	Stein	{}
198	Michael	Untersulzner	3358142677	info@untersulzner.com	\N	\N	\N	Miki	{}
216	Alessandro	Gozzi	3396211409		\N	\N	\N		{vip,"gift card"}
133	Vittorio	Roggero	3664159752		\N	\N	\N	Vito	{}
199	Anton	Amort	3333650957	toniolga@icloud.com	spazzola quadrata	\N	\N	Toni	{}
184	Riccardo	Gozzi	3338717110	ricky.gozzi961@gmail.com	\N	\N	\N	Ricky	{vip,"gift card"}
230	Mirco	Retto	3337209935	hiurko1970@gmail.com	\N	\N	\N	\N	{}
231	Marco	Carbonari	3427896208		\N	\N	\N	\N	{}
232	Robert	Frisanco	3358050430	renaterobi@alice.it	\N	\N	\N	\N	{}
233	gloria	posar	0471915055		\N	\N	\N	\N	{}
234	Alessandro	Barbin	3349674009	alessandro.barbin@outlook.com	\N	\N	\N	\N	{}
235	roberto	mazacc	3358114747	roberto.mazacc39@gmail.com	\N	\N	\N	\N	{}
236	Mike	Elmaz	3452342158	mike.elmaz@libero.it	\N	\N	\N	\N	{}
237	mauro	beagonzini	3316016264	mauroberg1@virgilio.it	\N	\N	\N	\N	{}
239	Giuseppe	Rinaldi	0471918404		\N	\N	\N	\N	{}
240	gianni	casalnuovo	3485728008	gb.minorplaner@gmail.com	\N	\N	\N	\N	{}
241	Mauro	Vanti	3288997626	info@studiovanti.it	\N	\N	\N	\N	{}
242	Adam	Rozak	2370555278		\N	\N	\N	\N	{}
244	Michele	Atzei	3337473058	micbora66@alice.it	\N	\N	\N	\N	{}
245	Luca	Atzei	3314734484		\N	\N	\N	\N	{}
246	guglielmo	abagnato	335253229		\N	\N	\N	\N	{}
247	Emiliana	Cesconi	3398278283		\N	\N	\N	\N	{}
248	Harald	Wieser	3381313819	harald.w.bz@gmail.com	\N	\N	\N	\N	{}
249	Fabrizio	Ghirardini	3933569755	ghira26@gmail.com	\N	\N	\N	\N	{}
250	Luca	Salin	3498836566	salu65@libero.it	\N	\N	\N	\N	{}
251	Vincenzo	Carpinelli	3286599755	vincenzo.carpinelli@gmail.com	\N	\N	\N	\N	{}
252	francesco	pisani	3293673004		\N	\N	\N	\N	{}
253	giacinto	della vecchia	3397490327		\N	\N	\N	\N	{}
254	roberto	guerra	3282777390	roby711@hotmail.it	\N	\N	\N	\N	{}
255	Matteo	Cassetti	3465298107	matteocassetti0@gmail.com	\N	\N	\N	\N	{}
256	Linda Willis	Luda	+37068501601	liuda27@yahoo.com	\N	\N	\N	\N	{}
257	ernesto	borsa	3332010742		\N	\N	\N	\N	{}
258	Giorgio	Pregnolato	3289778533		\N	\N	\N	\N	{}
259	Massimo	Rossetto	3295471826	massimo.rossetto3@tin.it	\N	\N	\N	\N	{}
260	Alessandra	Gennero	3471302650	gennero.alessandra@gmail.com	\N	\N	\N	\N	{}
261	mattias	costa	3335431012	mattias@costa.bz.it	\N	\N	\N	\N	{}
263	Mattia	Schenk	3277012660	mattiaschenk@gmail.com	\N	\N	\N	\N	{}
264	Fauzia	Segna	3472386506	fauzia.segna@yahoo.it	\N	\N	\N	\N	{}
265	Arianna	Faggionato	3484221012	faggionato.arianna@yahoo.it	\N	\N	\N	\N	{}
266	franco	benamati	3384810877		\N	\N	\N	\N	{}
267	Giovanni	Giacometti	3397449494		\N	\N	\N	\N	{}
268	Vincenzo	Mammone	3478691401		\N	\N	\N	\N	{}
269	davide	caliari	3347443924	davidecaliaribz@gmail.com	\N	\N	\N	\N	{}
270	Patrizia	Zamignan	3395662600	patty.morgana@virgilio.it	\N	\N	\N	\N	{}
271	bruno	bortolotto	3285591070	braun.bort@libero.it	\N	\N	\N	\N	{}
272	Guglielmo	Tomazzoni	3355622426	argentommy@gmail.com	\N	\N	\N	\N	{}
273	Giuseppe	Margani	3884568463	giuseppemargani@icluod.com	\N	\N	\N	\N	{}
274	renzo	de luca	3484416724		\N	\N	\N	\N	{}
275	Sophia	Toso	3421349445	sophi.toso@gmail.com	\N	\N	\N	\N	{}
276	erika	zancanella	3495288562		\N	\N	\N	\N	{}
277	Luca	Pregnolato	3408363637	cigo78@fastwebnet.it	\N	\N	\N	\N	{}
279	giovanni	fabbri	0471917411		\N	\N	\N	\N	{}
280	herbert	folie	3519885120	herbertfolie3@gmail.com	\N	\N	\N	\N	{}
281	Julian	folie	3349673926	julian_folie@hotmail.de	\N	\N	\N	\N	{}
282	ingrid	paulitsch	3663599659		\N	\N	\N	\N	{}
283	Gaia	Faggionato	3478721399		\N	\N	\N	\N	{}
284	Rudy	Tambos	3497266722	rudytambos@gmail.com	\N	\N	\N	\N	{}
285	Mattia	Benetti	3293263361	mattia_benetti@libero.it	\N	\N	\N	\N	{}
286	carlo	buglio	3386406460	ulcas@gmail.com	\N	\N	\N	\N	{}
287	Yohann	Wieser	3493802239		\N	\N	\N	\N	{}
288	Cristian	Salvadori	3496409647		\N	\N	\N	\N	{}
289	lamberto	peroni	3662309069		\N	\N	\N	\N	{}
290	pierr	quineche	3662309069		\N	\N	\N	\N	{}
291	Abdelali	Hamdi	32093675897		\N	\N	\N	\N	{}
292	alessandro	ferrari	3495379004	alex_f70@tiscali.it	\N	\N	\N	\N	{}
293	Patrizia	Binco	3388565404	pattybinco15@gmail.com	\N	\N	\N	\N	{}
294	leonard	patleiner	3409723971		\N	\N	\N	\N	{}
296	Christian	Planer	3485868238	p.christian1612@gmail.com	\N	\N	\N	\N	{}
297	Maurizio	Tonolli	3332351575	maurizio.tonolli@gmail.com	\N	\N	\N	\N	{}
298	Micol	Salvadori	3496409647	micolsalvadori@libero.it	\N	\N	\N	\N	{}
299	luciano	dalla villa	3287479693		\N	\N	\N	\N	{}
300	walter	lintner	3333148417		\N	\N	\N	\N	{}
301	Malgorzata	Kaczor	3245890668	marghekaczor@icolud.com	\N	\N	\N	\N	{}
302	Landino	Casari	3338124347		\N	\N	\N	\N	{}
303	Guglielmo	Manzio	3384562635	sifigusi@hotmail.com	\N	\N	\N	\N	{}
304	cornelia	cristel	3280020206		\N	\N	\N	\N	{}
305	Margherita	Biasin	3500739373		\N	\N	\N	\N	{}
306	Gaetano	Guarnaccia	3666746015	gaetano@progettoedile.com	\N	\N	\N	\N	{}
307	Franco	Beccaro	0471260252	avvocato@studiobeccaro.it	\N	\N	\N	\N	{}
308	Jacopo	Nardi	3492266338	jacoponardi96@gmail.com	\N	\N	\N	\N	{}
310	Francesco	Falliva	3348188150	fra.falliva@gmail.com	\N	\N	\N	\N	{}
311	leonilde	biotti	3391234589		\N	\N	\N	\N	{}
312	Antonella	Toso	3755997370	corranto64@gmail.com	\N	\N	\N	\N	{}
313	Adrian	Pan	3392446681	adrian.pan@provincia.bz.it	\N	\N	\N	\N	{}
314	giuseppe	rocca	3515300007	bkkptt@hotmail.com	\N	\N	\N	\N	{}
315	alberto	masiero	3391469934	masiero.alberto@rolmail.net	\N	\N	\N	\N	{}
316	Emilio	Corea	3351238888	info@emiliocorea.it	\N	\N	\N	\N	{}
317	giovanni	giacometti	0471270217		\N	\N	\N	\N	{}
318	Claudia	Mazzocchin	3927209582	c.mazzocchin@gmail.com	\N	\N	\N	\N	{}
319	Francesco	Banissoni	3356051495		\N	\N	\N	\N	{}
320	Lukas	Charisius	3392355963	lukas.charisius@jus.cc	\N	\N	\N	\N	{}
321	Andrea	Parduzzi	3453551581	andrea.parduzzi@gmail.com	\N	\N	\N	\N	{}
322	Matthias	Wallnhofer	3496439901		\N	\N	\N	\N	{}
323	Fabian	Sayer	3384270284	fabian.sayer@gmail.com	\N	\N	\N	\N	{}
324	massimo	tomio	3351224336	massimo.tomio@outlook.it	\N	\N	\N	\N	{}
325	Vittoria	Barbisan	3277171900		\N	\N	\N	\N	{}
326	giovanni	biasin	3791755947		\N	\N	\N	\N	{}
327	Silvia	Santorum	337495174	silvia.santorum@outlook.com	\N	\N	\N	\N	{}
328	Robert	Ausserer	3395681336	robertausserer@hotmail.com	\N	\N	\N	\N	{}
329	gian paolo	benetti	3426865778		\N	\N	\N	\N	{}
330	Federico	Pedrotti	+491634202294	info@federico-pedrotti.com	\N	\N	\N	\N	{}
331	pietro	moratelli	0471501300	info@studiomoratelli.it	\N	\N	\N	\N	{}
332	ciro	lopino	3333711546		\N	\N	\N	\N	{}
309	Luca	Samiolo	3396865309	luca.samiolo@cnhind.com	\N	\N	\N		{vip}
262	Gianni	Martinello	3355461000	gianni.martinello@4emme.it	\N	\N	\N	\N	{}
229	Josef	Berti	3248968151	josefberti4@gmail.com	\N	\N	\N	Sepp	{}
238	Gabriele	Salvadori	3466711403	gabriele.salvadori@gmail.com	\N	\N	\N	Gabba	{vip}
334	carla	borgogno	330521200		\N	\N	\N	\N	{}
335	Heidi	Maier	3395643545	heidelinde.maier@gmail.com	\N	\N	\N	\N	{}
336	Cristina	Colli	3296478210		\N	\N	\N	\N	{}
337	Ilaria	Salvadori	3459920758	ilariasalvadori08@gmail.com	\N	\N	\N	\N	{}
338	Ruth	Maier	3204239402	m.ruth@gmail.com	\N	\N	\N	\N	{}
340	riccardo	scavazza	3351206678	riccardo.scavazza@gmail.com	\N	\N	\N	\N	{}
341	Giancarlo	Gabanella	3336537943		\N	\N	\N	\N	{}
342	marco	bellisario	3466063171	bellimarco86@gmail.com	\N	\N	\N	\N	{}
343	Mario	Sparapani	3295790310		\N	\N	\N	\N	{}
345	Peter	Mian	3496101764		\N	\N	\N	\N	{}
346	Davide	Facchinelli	3485427481	fachinellidavide93@gmail.com	\N	\N	\N	\N	{}
347	Bruno	Rossi	3293795053	bruno.rossi@gmail.com	\N	\N	\N	\N	{}
349	Rita	Stagni	3393218160		\N	\N	\N	\N	{}
350	Maia	Karacic	3924072166		\N	\N	\N	\N	{}
351	Stefano	Carpi	3357713485	stefano.carpi@provincia.bz.it	\N	\N	\N	\N	{}
352	Astrid	Greupner	0471273211		\N	\N	\N	\N	{}
355	Franco	Bernard	3713247347	benardfranco280@gmail.com	\N	\N	\N	\N	{}
357	Julian	Folj	3349673926		\N	\N	\N	\N	{}
358	Nicole	Piazza	3482787486	nicck.piazza@gmail.com	\N	\N	\N	\N	{}
359	paolo	morandi	3472458230	p.morandi@gmx.net	\N	\N	\N	\N	{}
361	Thomas	Perktold	3713305659	tperktold@yaoo.com	\N	\N	\N	\N	{}
362	Marcus	Pfeifer	3479690323		\N	\N	\N	\N	{}
363	Cornelia	Cristel	3280020206		\N	\N	\N	\N	{}
364	Mario	Marini	3471253110		\N	\N	\N	\N	{}
365	alex	Agostini	3714906240	agostini@kulturinstitut.org	\N	\N	\N	\N	{}
366	Francesca	Corrias	3393698544	famcerscacorrias@alice.it	\N	\N	\N	\N	{}
367	Paul	De Zuel	3355748224	plezuo46@gmail.com	\N	\N	\N	\N	{}
368	Pietro	Bacca	3400812006		\N	\N	\N	\N	{}
369	Lorenzo	Tomio	3707092713	lorenzo.tomio19@gmail.com	\N	\N	\N	\N	{}
370	Alessandra	Ceglie	3407941047		\N	\N	\N	\N	{}
371	Anna	Guarienti	3669373030		\N	\N	\N	\N	{}
372	Robert	Andreoli	3496803333		\N	\N	\N	\N	{}
373	Anna	Salvadori	3917025310	pace_salva@hotmail.it	\N	\N	\N	\N	{}
375	Thomas	La Monica	3382162859	thomas.lamonica27@gmail.com	\N	\N	\N	\N	{}
376	Nicola	Barattin	3921980922	nicotrumpet@gmail.com	\N	\N	\N	\N	{}
377	Francesco	Pisani	3293673004		\N	\N	\N	\N	{}
378	Manuela	Chiomia	0471270672	manuela.chi@gmail.com	\N	\N	\N	\N	{}
379	Manuela	Chiomia	0471270672	manuela.chi@gmail.com	\N	\N	\N	\N	{}
380	Judith	Board	3203844167	judyboard@libero.it	\N	\N	\N	\N	{}
382	Massimo	Flaim	3497392328	max@flaims.it	\N	\N	\N	\N	{}
383	Mariasole	Moggio	3664102442	mariasole.mail96@gmail.com	\N	\N	\N	\N	{}
384	Joseph	Jackobsen	3459920758		\N	\N	\N	\N	{}
385	Gazmen	Kumrijia	3201870481	kumrijabau@hotmail.com	\N	\N	\N	\N	{}
386	Marco	Shoepf	3358252466	m.schoepf@gmail.com	\N	\N	\N	\N	{}
387	Luca	Schoepf	3358252466		\N	\N	\N	\N	{}
388	Elisa	Bernini	3338348116	bernini.elisa@gmail.com	\N	\N	\N	\N	{}
389	Mattia	Benetti	3293263361	mattia_benetti@libero.it	\N	\N	\N	\N	{}
390	monica	benamati	3339308890		\N	\N	\N	\N	{}
391	Sophie	Morelli	3385825409	sophie.morelli@yahoo.com	\N	\N	\N	\N	{}
392	Rossella	Morosin	3463557992	rossi1974@live.it	\N	\N	\N	\N	{}
394	Luana	Tigliani	3405611751		\N	\N	\N	\N	{}
395	luca	fasoli	3926226714	luca@dynasystems.it	\N	\N	\N	\N	{}
396	Zhanna	Proskuroina	3896523999	przhanna@libero.it	\N	\N	\N	\N	{}
397	Erika	Orlandini	3401794535	erika.orlandini.92@gmail.com	\N	\N	\N	\N	{}
398	Davide	Bottura	3470633150	davidebottura76@gmail.com	\N	\N	\N	\N	{}
399	Giuseppe	Iacoviello	3202732088		\N	\N	\N	\N	{}
401	Matteo	Marabotti	3896245389	m.marabotti91@gmail.com	\N	\N	\N	\N	{}
402	Benjamin	Fazzi	3274669376	benjamin20302@gmail.com	\N	\N	\N	\N	{}
403	Sabine	Breit	3776798228		\N	\N	\N	\N	{}
404	Lorenz	Corradini	3331138338	lorenz.corradini@gmail.com	\N	\N	\N	\N	{}
405	Eugenio	Pennini	3396334770		\N	\N	\N	\N	{}
406	Liuda	Willis	+37068501601		\N	\N	\N	\N	{}
407	Massimo	Giomi Woody	3332163876	m.giomi1966@gmail.com	\N	\N	\N	\N	{}
408	Elisabeth	Ortner	3493764618	elisabeth.ortner@hands-bz.it	\N	\N	\N	\N	{}
409	Sara	Dolzan	3396056078		\N	\N	\N	\N	{}
410	Reissa	Benko	3288279115		\N	\N	\N	\N	{}
411	Barbara	Martinello	3466091399	barbara.martinello@icloud.com	\N	\N	\N	\N	{}
412	giuseppe	mariani	3487291270		\N	\N	\N	\N	{}
413	alain	citton	3420685232	alainjr@hotmail.it	\N	\N	\N	\N	{}
414	Cristina	Bertoli	3280141843		\N	\N	\N	\N	{}
415	Antonella	Bendici	3343301109	anto64bz@gmail.com	\N	\N	\N	\N	{}
416	sandro	fiorani	3478371888		\N	\N	\N	\N	{}
417	Marisa	Vecchi	0471286338		\N	\N	\N	\N	{}
418	Paolo	Capri	3494681868	paolo.capri@outlook.it	\N	\N	\N	\N	{}
419	Matteo	Pironi	3336325101		\N	\N	\N	\N	{}
420	giovanni	zuech	0471 282754		\N	\N	\N	\N	{}
421	Angelica	Sagrawa	3665408497		\N	\N	\N	\N	{}
423	Eleonora	Prando	3349200442		\N	\N	\N	\N	{}
424	Ivo	Baumgartner	0471548111		\N	\N	\N	\N	{}
425	Nadia	Zvolysnka	3406919142		\N	\N	\N	\N	{}
426	Jessica	Broggio	3496458727		\N	\N	\N	\N	{}
427	Ivana	Bottan	3389310594		\N	\N	\N	\N	{}
428	Markus	Kerschbaumer	3711344183		\N	\N	\N	\N	{}
429	mattia	mazzel	3487796249		\N	\N	\N	\N	{}
430	Stefan	Puff	3342335993		\N	\N	\N	\N	{}
431	Andrea	Derobez	3384089916		\N	\N	\N	\N	{}
432	leonardo	carlini	3385017698		\N	\N	\N	\N	{}
433	manuela	nardin	3398857305		\N	\N	\N	\N	{}
434	Manuel	Piliego	3283558839		\N	\N	\N	\N	{}
435	Martha	Pfitscher	3398534070		\N	\N	\N	\N	{}
436	Gerardo	Morello	3333601293	gerardo.morello86@gmail.com	\N	\N	\N	\N	{}
437	Daniel	Santuliana	3493252281		\N	\N	\N	\N	{}
438	emilio	polito	3332768619	emil.polito@yauu.it	\N	\N	\N	\N	{}
439	Barbara	Martinello	3466091399		\N	\N	\N	\N	{}
440	andreas	oberkofler	3332789288	anderoberkofler71@gmail.com	\N	\N	\N	\N	{}
441	roberto	fabro	3311758225	info@centroconsulenzaeservizi.it	\N	\N	\N	\N	{}
442	renato	boccola	3394728959		\N	\N	\N	\N	{}
443	Luca	Jesi Ferrari	3468472211		\N	\N	\N	\N	{}
444	katarina	plattner	3483232006		\N	\N	\N	\N	{}
422	Stefanao	Giongo	1234567		marito Barbara Vio	\N	\N	\N	{}
381	Roman	Ausserer	0471289482		\N	\N	\N	\N	{}
353	Carlo	Döcker	3357031154		\N	\N	\N	\N	{}
400	Daniela	Brancaglion	3491304279	danielayaya@alice.it	\N	\N	\N	\N	{}
339	ernesto	coppola	3281093450		\N	\N	\N	Frenk	{}
344	Michael	Lintner	3493673492	info@meykey-video.it	\N	\N	\N	Miki	{}
354	Alessandra	Viezzoli	3475611742	perigea@gmail.com	\N	\N	\N	Ale	{}
393	Giovanni	Campagnoli	3392191355		marito Marisa Giovanazzi	\N	\N	Gianni	{}
446	roberto	cristinelli	3393507937		\N	\N	\N	\N	{}
447	Gioetta	Faes	0471285905		\N	\N	\N	\N	{}
448	Cristina	Scapolan	0471922929		\N	\N	\N	\N	{}
449	virgigno	brozzi	3409240430		\N	\N	\N	\N	{}
450	Enrico	Carpentari	3386215855		\N	\N	\N	\N	{}
451	Christian	Zintelli	3337766662		\N	\N	\N	\N	{}
452	Stefano	Rinaldi	3484120096		\N	\N	\N	\N	{}
453	Marina	Fantini	3387680571		\N	\N	\N	\N	{}
454	Alessio	Crea	3284224951		\N	\N	\N	\N	{}
455	ingrid	trisorio	3738656889		\N	\N	\N	\N	{}
456	Elisa	Sperduti	3491563415		\N	\N	\N	\N	{}
457	roberto	milea	3387464663		\N	\N	\N	\N	{}
458	Barbara	Gioco	3926185561		\N	\N	\N	\N	{}
459	Giulia	Fontana	3398516741		\N	\N	\N	\N	{}
460	Maurizio	Travaglini	3387085686	maurizio_travaglini@virgilio.it	\N	\N	\N	\N	{}
461	Corrado	Fiocchiaro	3492948640		\N	\N	\N	\N	{}
462	Francesco	Golinelli	3274705079		\N	\N	\N	\N	{}
463	Simonetta	Piva	3200764487	pisimonetta23@gmail.com	\N	\N	\N	\N	{}
464	marco	vangelisti	3270524283		\N	\N	\N	\N	{}
465	Angelica	Sagrava	3665408497		\N	\N	\N	\N	{}
466	Antonella	Martinello	3331312629		\N	\N	\N	\N	{}
467	Emma	Gigliotti	3492112502		\N	\N	\N	\N	{}
468	Lucia	Gigliotti	3806352718		\N	\N	\N	\N	{}
469	ario	biotti	3349244304		\N	\N	\N	\N	{}
470	Caterina	Valente	3331332270		\N	\N	\N	\N	{}
471	Nadia	Deruachi	3891376434		\N	\N	\N	\N	{}
472	antonia	martini	3331332270		\N	\N	\N	\N	{}
473	Walter	Prearo	123456789		\N	\N	\N	\N	{}
474	Patrick	Bevilacqua	3484068551		\N	\N	\N	\N	{}
475	eleonora	sailer	3351048108		\N	\N	\N	\N	{}
477	emilia	pargalia	3426449440		\N	\N	\N	\N	{}
478	Alessandro	Bonvicin	3208626998		\N	\N	\N	\N	{}
479	Paolo	Costalonga	3334383483		\N	\N	\N	\N	{}
480	Amedeo	Profeta	3277955701		\N	\N	\N	\N	{}
481	Manuel	Kerschbaumer	3711344183		\N	\N	\N	\N	{}
483	Giovanni	Dalmasso	3484065648		\N	\N	\N	\N	{}
485	Tiziano	Galise	3314633053		\N	\N	\N	\N	{}
486	Nicolo'	Dema	3290807065		\N	\N	\N	\N	{}
487	Franco	Benamati	3339308890		\N	\N	\N	\N	{}
488	Sonia	Bottone	3807795511		\N	\N	\N	\N	{}
489	michele	defrancesco	3480565524	micheledrfrancesco1@gmail.com	\N	\N	\N	\N	{}
490	Enzo	Mazzer	3472536917		\N	\N	\N	\N	{}
491	Susi	Vajova	3483846169		\N	\N	\N	\N	{}
492	Ester	Pomarolli	3484625624	ester.pomarolli@gmail.com	\N	\N	\N	\N	{}
493	Alessandra	Zeni	3338391117		\N	\N	\N	\N	{}
494	Gabriele	Ansaldo	3247415770		\N	\N	\N	\N	{}
495	Stefania	Saba	3408377511		\N	\N	\N	\N	{}
496	valentin	gasser	3202771784		\N	\N	\N	\N	{}
497	Alice	Panicciari	3465884379	alice_panicciari@yahoo.it	\N	\N	\N	\N	{}
498	Leonardo	Carnini	3385017698		\N	\N	\N	\N	{}
500	sonia	bacca	15123132380		\N	\N	\N	\N	{}
501	Giuseppe	Rinaldi	0471537091		\N	\N	\N	\N	{}
502	Matteo	Lescio	3333777277		\N	\N	\N	\N	{}
2	Paola	Tonolli			\N	\N	\N	\N	{}
3	Paola	Zimmermann	3394897478		\N	\N	\N	\N	{}
513	Michela	Musmeci	3290196019		Ottica Gries	[{"prodotto":"Cera Quality bianca","data":"2025-07-04","prezzo":19,"quantita":1,"note":""}]	\N	\N	{}
197	Monica	Mercante	349 1665526	info@agenziadelia.it	\N	\N	\N	\N	{}
515	Erica	Oxenreiter	3280381245		cognata Micol Salvadori	[{"prodotto":"Litro sh Quality","data":"2025-02-28","prezzo":39,"quantita":1,"note":""},{"prodotto":"Olio Quality","data":"2025-02-28","prezzo":19,"quantita":1,"note":""},{"prodotto":"Sh Quality litro","data":"2025-07-10","prezzo":39,"quantita":1,"note":""}]	\N	\N	{}
508	Graziella	Raffaelli			mamma Sara Bodecchi	\N	\N	\N	{}
333	Sonia	Fontana	04711049464		\N	[{"prodotto":"olio Quality","data":"2025-02-15","prezzo":19,"quantita":1,"note":""}]	\N		{vip}
360	Loredana	Gobbetti	3497219088		piega 15 - frangia 10 - tg 22	\N	\N	\N	{}
499	Lucia	Saccani	336450528		Moglie Pietro Marini	[{"prodotto":"Quality hair cream","data":"2025-06-27","prezzo":19,"quantita":1,"note":""},{"prodotto":"Profumi ambiente","data":"42025-06-19","prezzo":30,"quantita":2,"note":"15 cadauno"}]	\N	\N	{}
514	Federica	Willhelm	3494499123		\N	[{"prodotto":"Maschera Quality","data":"2025-02-12","prezzo":20,"quantita":1,"note":""},{"prodotto":"olio Quality","data":"2025-02-02","prezzo":19,"quantita":1,"note":""}]	\N	\N	{}
188	Claudia	Dotti	3397602362		Mamma Bruz	[{"prodotto":"Shampoo Quality","data":"2025-04-18","prezzo":19,"quantita":1,"note":""}]	\N	\N	{}
39	Lorenzo	Gattolin	3713853014	google@lorgat.it	\N	[{"prodotto":"cera Quality","data":"2025-06-25","prezzo":19,"quantita":1,"note":""}]	\N	\N	{}
348	Paolo	Fontana	0471286338			\N	\N	\N	{}
512	Giulia	Lombardi			\N	\N	\N	\N	{}
15	Renate	Neulichedl	3471656842		amica Ricky	[{"prodotto":"cera quality","data":"2025-01-25","prezzo":19,"quantita":1,"note":""},{"prodotto":"cera quality + dopobarba","data":"2025-03-13","prezzo":19,"quantita":2,"note":"19 cadauno"}]	\N	\N	{}
517	Daniela	Ketmaier	3337883452		preferisce capelli gonfi	\N	\N	\N	{}
484	Claudio	Marasca	3470125626		\N	[{"prodotto":"cera Quality marrone","data":"2025-07-04","prezzo":19,"quantita":1,"note":""}]	\N	\N	{}
482	Claudio	Pisoni	3450204820		Skanners Singer	\N	\N	\N	{}
516	Riccardo	Sconosciuto	3273155106		\N	\N	\N	\N	{}
356	Katiuscia	Pili	3403498395	katiusciapili@hotmail.it	\N	[{"prodotto":"cera Quality Bianca","data":"2025-02-25","prezzo":19,"quantita":1,"note":""}]	\N	\N	{}
18	Antonella	Bellante	3298082263	anto.bellante63@gmail.com	ama i cosmetici	[]	1963-06-12	Anto	{Vip}
46	Luca	Moscon	0471203652	luca.moscon@studiomoscon.it	\N	[{"prodotto":"Sh Quality","data":"2025-07-08","prezzo":19,"quantita":1,"note":""},{"prodotto":"Quality cera wax","data":"0025-02-08","prezzo":19,"quantita":1,"note":""}]	\N	\N	{}
85	Stefano	Pesce	3333303600	stevenfish@alice.it	\N	[{"prodotto":"Quality cera wax","data":"2025-02-06","prezzo":19,"quantita":1,"note":""}]	\N	Fish	{}
125	Paolo	Dallapiazza	3457354153	paolo.dallapiazza.1996@gmail.com	\N	[{"prodotto":"cera quality","data":"2025-06-27","prezzo":19,"quantita":1,"note":""},{"prodotto":"Sh Quality","data":"2025-05-07","prezzo":19,"quantita":1,"note":""}]	\N	\N	{}
14	Mara	Demarchi	3396787405		Amica Isa	\N	\N	\N	{}
445	Michela	Dell'Aquila	3334765778		\N	\N	\N		{}
102	Daria	Thurner	3389918329		\N	\N	\N	Daria	{}
476	Carla	Spiller	3473582708		beve il caffe ogni volta	[{"prodotto":"profumo piccolo nr IV","data":"2025-06-20","prezzo":10,"quantita":2,"note":"€ 5 cadauno"}]	\N		{vip,caffe,silenzioso}
518	Ennio	Ambrosi			\N	\N	\N	\N	{}
510	Michela	Albanese	3914080576	rufus.albanese@gmail.com	moglie Nelli	[{"prodotto":"Fluido Antistress","data":"2025-04-05","prezzo":19,"quantita":1,"note":""},{"prodotto":"Flexy Curl","data":"2024-09-14","prezzo":19,"quantita":1,"note":""},{"prodotto":"Pettine","data":"2024-11-16","prezzo":9,"quantita":1,"note":""},{"prodotto":"Profumo piccolo","data":"2024-01-10","prezzo":5,"quantita":1,"note":""}]	\N	\N	{}
519	Nelli	Seilor			moglie Michela Albanese\nal 25 luglio ha ancora 1 taglio dal buono omaggio	\N	\N	\N	{}
295	Barbara	Vio	3393846915	baby.vio@gmail.com	Baby - moglie Stefano Giongo	\N	\N	Baby	{}
183	Massimiliano	Roubal	3381732339	rubimaxi@yaoo.it	\N	[{"prodotto":"Quality wax + Quality maschera argan","data":"2025-07-12","prezzo":38,"quantita":2,"note":"19 cad"}]	\N	Max	{}
520	Astrid	Deluca			cliente Cinzia	\N	\N		{"cliente Cinzia"}
228	Felice	Sansonetti	3474018197	sansonetti@alice.it	\N	\N	\N	Felix	{vip}
521	Silvana	Dalla Rosa	3494350311		\N	\N	\N	Nonna Gozzi	{vip,"gift card"}
522	Valentina	Marchi	3334899224	valeentina95@gmail.com	\N	\N	\N	Vale	{vip}
51	Marco	Lombardozzi	3356085850	info@gestioni3a.it	\N	\N	\N	Lomba	{"gift card",vip}
278	Gabriel	Gottardi	3421908179	gabriel80bz@gmail.com	\N	\N	\N		{vip}
115	Luca	Ianeselli	3473672615	lucaianeselli@gmail.com	adora i Tattoo	\N	\N		{vip,tattoo,caffe}
523	Dimitri	Rampulla	3761060138		\N	\N	\N		{inaffidabile}
109	Roland	Ausserer	34723275017	office@elektralight.com	\N	\N	\N		{inaffidabile,caffe}
374	Alex	Pattis	3409574815	alexpattis99@gmail.com	\N	\N	\N	alex	{}
17	Sara	Bodecchi	3357957657	sara.bodecchi@gmail.com		[{"prodotto":"quality oil","data":"2025-07-17","prezzo":24,"quantita":1,"note":""}]	\N		{"vicina di casa"}
525	Sandro	Stefanati	3333173095	sandro.stefanati@gmail.com	questo è un profilo di prova di tutte le funzioni	[{"prodotto":"sh Quality","data":"2025-08-07","quantita":1,"note":"al bisogno da cute asciutta","prezzo_unitario":19,"pagato":true}]	1966-07-24	Scissor	{"account prova",vip,"caffe lungo",allergia,silenzioso,inaffidabile}
\.


--
-- Data for Name: impostazioni; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.impostazioni (chiave, valore) FROM stdin;
google_sync_token	CN_AhMW-_Y4DEN_AhMW-_Y4DGAUg1JTf9wIo1JTf9wI=
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: trattamenti; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trattamenti (id, cliente_id, tipo_trattamento, descrizione, data_trattamento, note, prezzo, pagato) FROM stdin;
17	409	prova	questa Ã¨ una prova	2025-06-04	sempre prova	\N	f
19	499	Colore	solo base 30cc 8.0 + 30cc 8 ice a 20 vol	2025-06-05		\N	f
20	162	Taglio e barba 	Taglio rasato e barba modellata 	2025-06-05	15 tg / 15 barba 	\N	f
2	2	colore	30 cc 6.0 + 30cc 7.3 a 20 vol tirata sulle lunghezze	2025-06-13	€ 45	\N	f
3	101	Colore	base 90 cc 6.50    echos    a 20 vol    tirata lungh al lavaggio + kromask pumpkin	2025-06-13	40 + 20	\N	f
8	3	Colore	base 7.0 a 20 vol + lungh tonalizzate con 9.32 a 10 vol 1 a 2 + kromask beige	2025-06-13	45+30	\N	f
6	3	Colore	schiariture a 30 vol  + base 7.0 a 20 vol + tonalizz 50cc 9.3+25cc 8.3 a10 vol 1 a 2 	2025-05-10	50+45+30	\N	f
43	508	Colore	base 90 cc 6.0  a 20 vol	2023-07-27	48	\N	f
73	360	Colore	solo base 30cc 7.44 + 20cc 7.0 a 20 vol	2025-06-02	piega 15 - tg frangia 10-  tg intero 22	35.00	f
80	113	Taglio	taglio corto	2025-07-16		27.00	f
71	46	Colore	20cc 12.0 + 1 cm nero blu a 10 vol 1a2.  5 min posa 	2025-07-08	tg 25	15.00	f
12	14	Colore	50cc 1.0 a 20 vol	2025-06-18	40 colore 27 tg	\N	f
15	197	Colore	 base     45 cc 7.0+15cc 6.0     a 20 vol 	2025-02-01	40	\N	f
16	197	Colore e schiariture	balajage deco a 20 vol + base 45 cc 7.0 + 15cc 6.0  e   lungh. 10.0+ 8.43  a 20 vol	2025-03-28	40+60	\N	f
23	192	Colore	base e lungh.   20cc 6.1 + 30cc 7.3 + 5cc 6.34 a 20 vol + kromask beige	2025-05-17	colore 60+kromask 20 +tg 25	\N	f
25	476	Meches	balajage a 30 vol + tonalizz 7.44+8.54 a 10 vol 1a2     20 min	2025-05-24	55+20	\N	f
18	18	Colore	base 7.0 a 20 vol + lungh kromask biondo	2025-05-24		\N	f
54	87	Taglio	taglio rasato a macchinetta	2025-07-01	15	\N	f
24	476	Colore	solo base    35cc 6.0 + 35cc 6.01    a 20 vol + kromask rame	2025-05-16	40+20	\N	f
26	476	Colore	solo base 35cc 6.0 + 35cc 6.ice+kromask rame 	2025-06-19	40+20	\N	f
37	18	Colore	Base 70cc 7.0 a 2o vol + lunghe. 40cc 0.0 a 10 vol 1a2 10 min	2025-06-21		\N	f
42	179	Colore	base 60 cc 12.0 a 40 vol 1 a 2 + kromask oro	2025-06-10	70 tutto	70.00	f
39	15	Colore e schiariture	base 35 cc6.0 + 35cc 7.0 a 20 vol  + sopra meches deco a 20 vol	2025-01-25	40+20	\N	f
38	15	Colore	base 35cc 6.0 + 35cc 7.0 a 20 vol + kromask Argento	2025-03-13	40+20	\N	f
40	510	Colore	60 cc 8.4+ 20cc 7.44 a 20 vol + lungh kromask rame	2025-05-31	40+15	\N	f
46	15	Colore e schiariture	Base 40cc 6.0 + 30cc 7.0 + sopra meches deco a 20 vol	2025-06-27	40+30	\N	f
47	125	Trattamento	quality maschera argan	2025-06-27	20 tratt + 25 tg	\N	f
48	510	Colore	base 70cc 8.4 a 20 vol + lungh kromask rame	2025-06-28	40+15	\N	f
49	150	Colore	base e lungh  20cc 6.01 + 10cc 6.0 a 20 vol	2025-06-28	30	\N	f
57	220	Taglio	Taglio a forbice 	2025-07-04	attenzione agli angoli	\N	f
56	219	Taglio	Taglio sfumato 	2025-07-01	Tosatrice 3/6/9	\N	f
75	142	Taglio e barba	taglio corto e rasatura barba con impacco	2025-07-09	250 tg + 15 barba	40.00	f
52	333	Colore	base tirata lungh.      30cc 4.72 + 30cc 4.0       a 20 vol	2025-07-01		45.00	f
53	86	Colore	base 50cc 12.0 + 20cc 10.0 + 20cc 10.3 a 20 vol	2025-05-23	Stefano tg 15	40.00	f
59	295	Colore	basi 6.4 + 6.0 a 20 vol	2025-07-01	piega 20	40.00	f
62	278	Permanente	solo sopra con bigodini rossi e gialli	2025-04-19	tg 25	50.00	f
63	171	Permanente	solo sopra bigodini gialli e verdi	2025-03-09	tg 25	40.00	f
64	512	Permanente	tutta la testa bigodini viola	2025-06-07		65.00	f
65	513	Taglio	Corto in avanti sfoltito 	2025-07-04	Tg 22 + piega 15	37.00	f
66	132	Colore	base 50 cc 10.3 a 40 vol + kromask gold	2025-06-07	40 tn +25 kromask	65.00	f
67	132	Piega	fango al lavatesta + sh quality	2025-05-31		22.00	f
68	133	Trattamento	masch quality al lavaggio	2025-05-31		13.00	f
69	514	Colore	koleston perfect 60cc 88./0 + 20cc 9/3 a 20 vol 1a1 + maschera argan	2025-02-12	40 tn +20 mask	60.00	f
21	188	Colore	base e lungh        20cc 8.3 + 20cc 7.0       a 20 vol	2025-06-06		35.00	f
55	118	Taglio e barba	pizzetto	2025-07-01	25 tg +15 barba	40.00	f
70	515	Colore	bagno colore 50cc 5.0 a 10 vol 1 a 2	2025-05-06	frangia 5	35.00	f
72	85	Meches	meches con cuffia deco a 35 vol	2025-02-06		30.00	f
76	515	Colore	Idem 60 cc a 20 vol 1 a 2	2025-07-10	tg 	35.00	f
77	356	Colore	base  30cc  4.0+30cc 3.0   a 20  vol tirata lunghezze	2025-02-25		45.00	f
74	517	Trattamento	fluido antistress + Quality maschera argan	2025-04-16		20.00	f
78	251	Taglio e barba	Taglio corto dietro sfumato e rasatura	2025-07-11		40.00	f
79	3	Colore	Base 50 cc 7.0 a 20 vol + lunghi. Kromask beige	2025-07-11	Tn 45 + kromask 20\nCambiato taglio 	65.00	f
81	517	Trattamento	idem	2025-07-18		20.00	f
82	356	Colore	35cc 4.0 +35cc 3.0 a 20 vol tirata lunghezze	2025-07-17		45.00	f
83	510	Colore	60 cc 8.4+ 20cc 7.44 a 20 vol + lungh kromask rame	2025-07-18	40 colore + 15 kromask	40.00	f
84	519	Taglio	taglio da uomo	2025-05-06	taglio 22 + piega 10	32.00	f
85	192	Colore	base e lungh.   50cc 6.0 + 10cc 6.34 a 20 vol + kromask beige	2025-06-20	60 colore + 20 kromask +tg 25	80.00	f
86	423	Taglio	taglio corto	2025-06-05	kromask argento 20	27.00	f
87	70	Taglio	taglio corto dietro e scalato ai lati	2025-05-13	prezzo piega compresa	35.00	f
88	466	Taglio	taglio corto	2024-10-24	prezzo piega compresa	37.00	f
89	63	Trattamento	masch quality	2025-01-23	20 tg 2o tratt	40.00	f
90	145	Taglio	taglio corto	2025-06-11	22 tg 20 piega	42.00	f
91	189	Taglio	taglio cortissimo ai lati 3mm	2025-06-27		27.00	f
92	323	Taglio	taglio tutto a 6 mm sfumato a 3 sotto e basette	2025-06-20		20.00	f
94	311	Trattamento	masch quality al lavatesta	2025-06-20	tg 22 piega 20 tratt 10	10.00	f
95	214	Taglio	taglio uomo corto	2025-05-14		27.00	f
10	39	Taglio e barba	barba a punta e rasatura ai contorni	2025-06-13		40.00	f
9	264	Colore	 base 6.0 + 6.01 a 20 vol + lungh kromask caramello + impacco	2025-06-13	35 base + 20 kromask + 25 impacco	80.00	f
11	109	Colore	flash 5cc 3.0 + 5cc 5.01 a 10 vol 1a2	2025-06-17	€ 15 tratti + 25 tg	15.00	f
51	115	Trattamento	maschera Quality + sh quality	2025-06-29	20 + 20 tg +15 barba	20.00	f
96	131	Taglio	taglio sfoltito e corto	2025-06-20		27.00	f
97	499	Colore	solo base 35cc 8.0 + 35cc 8ice a 20 vol	2025-07-24		40.00	f
1	354	Colore	30cc 12.0 + 30 cc 10.3  a 30 vol 1 a 2	2025-06-12	piega compresa 	47.00	f
41	179	Colore e schiariture	base sotto 50 cc 12 a 40 vol 1 a 2 + sopra base e lungh deco a 30 vol	2025-05-05	base 40 + sopra base e deco 35  + piega 10	75.00	f
98	517	Trattamento	idem	2025-07-10		20.00	f
100	264	Colore e schiariture	balajage a 20 vol con sopra 2 torc    +    base 30cc 5.0 + 45cc 5.0 + 15cc 7.ice a 20 vol + ton lungh caramello a 10 vol 1a2	2025-07-28	60 balajage + 35 base + 25 impacco	120.00	f
101	141	Colore	20cc 5.ice    a 10 vol 1a2	2025-07-29	flash 15 tg 25	15.00	f
102	179	Colore	base 55 cc 10.0 + 10cc 9.0  a 40 vol      + kromask oro	2025-07-30	70 tutto	70.00	f
103	517	Trattamento	idem	2025-08-02		20.00	f
99	517	Trattamento	idem	2025-07-25		20.00	f
104	85	Permanente	bigodini gialli , rossi e verdi solo sopra	2025-08-01		50.00	f
105	56	Taglio	razor curl	2025-08-06	vedi foto	25.00	f
108	17	Taglio	tagliato solo 2 cm le punte tutti pari	2025-08-08	22 tg + 22 piega	22.00	f
109	38	Taglio	spazzola quadrata	2025-08-08		25.00	f
110	523	Taglio	taglio razor sopra bucato	2025-08-08		25.00	f
107	126	Colore	base e lungh 25cc 9.0 + 25cc 9.32 a 20 vol	2025-08-07		40.00	t
60	126	Colore	base e lungh 30cc 9.0 + 30cc 9.32 a 20 vol	2025-05-29		40.00	t
61	126	Colore e schiariture	base 30cc 9.0 + 30cc 9.32 + meches sopra deco a 10 vol	2024-10-25	37 base 30 meches	67.00	t
106	525	Trattamento	maschera quality argan + fluido a/f + sh quality	2025-07-22	1x sett x 4 sett	20.00	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, created_at, email, google_id) FROM stdin;
1	admin	2025-07-18 16:40:06.054291+02	\N	\N
2	Quality Hair	2025-07-22 17:45:00.442432+02	qualityhairbolzano@gmail.com	117429691498289453079
\.


--
-- Name: acquisti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.acquisti_id_seq', 1, false);


--
-- Name: analisi_tricologiche_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analisi_tricologiche_id_seq', 7, true);


--
-- Name: calendar_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calendar_events_id_seq', 14443, true);


--
-- Name: client_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_photos_id_seq', 58, true);


--
-- Name: clienti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clienti_id_seq', 525, true);


--
-- Name: trattamenti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trattamenti_id_seq', 110, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: acquisti acquisti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acquisti
    ADD CONSTRAINT acquisti_pkey PRIMARY KEY (id);


--
-- Name: analisi_tricologiche analisi_tricologiche_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisi_tricologiche
    ADD CONSTRAINT analisi_tricologiche_pkey PRIMARY KEY (id);


--
-- Name: app_sessions app_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_sessions
    ADD CONSTRAINT app_sessions_pkey PRIMARY KEY (sid);


--
-- Name: calendar_events calendar_events_google_event_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_google_event_id_key UNIQUE (google_event_id);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (google_event_id);


--
-- Name: client_photos client_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_photos
    ADD CONSTRAINT client_photos_pkey PRIMARY KEY (id);


--
-- Name: clienti clienti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clienti
    ADD CONSTRAINT clienti_pkey PRIMARY KEY (id);


--
-- Name: impostazioni impostazioni_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impostazioni
    ADD CONSTRAINT impostazioni_pkey PRIMARY KEY (chiave);


--
-- Name: session sessioni_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT sessioni_pkey PRIMARY KEY (sid);


--
-- Name: trattamenti trattamenti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trattamenti
    ADD CONSTRAINT trattamenti_pkey PRIMARY KEY (id);


--
-- Name: users unique_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- Name: users unique_google_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_google_id UNIQUE (google_id);


--
-- Name: users unique_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: IDX_app_sessions_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_app_sessions_expire" ON public.app_sessions USING btree (expire);


--
-- Name: idx_analisi_cliente_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analisi_cliente_id ON public.analisi_tricologiche USING btree (cliente_id);


--
-- Name: acquisti acquisti_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acquisti
    ADD CONSTRAINT acquisti_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clienti(id) ON DELETE CASCADE;


--
-- Name: analisi_tricologiche analisi_tricologiche_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisi_tricologiche
    ADD CONSTRAINT analisi_tricologiche_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clienti(id) ON DELETE CASCADE;


--
-- Name: client_photos client_photos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_photos
    ADD CONSTRAINT client_photos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clienti(id) ON DELETE CASCADE;


--
-- Name: trattamenti fk_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trattamenti
    ADD CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES public.clienti(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

