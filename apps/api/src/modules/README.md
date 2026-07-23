# `src/modules`

One folder per feature module, each self-contained and independently removable:

```
modules/
└── quiz/
    ├── quiz.routes.ts       # HTTP surface, mounted from src/routes/index.ts
    ├── quiz.service.ts      # orchestration
    ├── quiz.repository.ts   # Kysely access (app.db / the db instance)
    └── quiz.schema.ts       # zod validation (shared contracts live in @quiz/shared)
```

Modules talk to each other through explicit exports only — never by reaching
into another module's internals.

Empty during the infrastructure phase.
