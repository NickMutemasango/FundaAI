CREATE TABLE passages (
    id text PRIMARY KEY,
    language text NOT NULL CHECK (language IN ('shona', 'ndebele')),
    level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    content jsonb NOT NULL,
    review_status text NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft', 'approved')),
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (jsonb_typeof(content) = 'object'),
    CHECK (content->>'id' = id),
    CHECK (content->>'language' = language),
    CHECK (content->>'level' = level)
);
CREATE INDEX passages_language_level_idx ON passages(language, level);
-- Foundation only: authentication and result-writing endpoints come later.
CREATE TABLE learners (
    id uuid PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE quiz_results (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    learner_id uuid NOT NULL REFERENCES learners(id),
    passage_id text NOT NULL REFERENCES passages(id),
    selected_index integer NOT NULL CHECK (selected_index >= 0),
    correct boolean NOT NULL,
    submitted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX quiz_results_learner_idx ON quiz_results(learner_id, submitted_at);
