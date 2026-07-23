# `src/features`

Feature-sliced UI. One folder per feature, each owning its components, hooks
and state:

```
features/
└── quiz/
    ├── components/
    ├── hooks/
    └── quiz.store.ts
```

`src/app` only composes routes from features; `src/components/ui` stays purely
presentational (shadcn/ui primitives).

Empty during the infrastructure phase.
