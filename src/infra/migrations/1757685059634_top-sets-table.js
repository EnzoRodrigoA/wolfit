export const up = (pgm) => {
  pgm.createType("feeling_enum", [
    "very-light",
    "light",
    "peaceful",
    "heavy",
    "insane",
  ]);

  pgm.createTable("top_sets", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    user_id: {
      type: "uuid",
      notNull: true,
    },

    workout_exercise_id: {
      type: "uuid",
      notNull: true,
    },

    load: {
      type: "numeric",
      notNull: true,
    },

    reps: {
      type: "integer",
      notNull: true,
    },

    feeling: {
      type: "feeling_enum",
    },

    date: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });

  pgm.createTable("workout_history", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    user_id: {
      type: "uuid",
      notNull: true,
    },

    workout_id: {
      type: "uuid",
      notNull: true,
    },

    completed_at: {
      type: "timestamptz",
      notNull: true,
    },
  });
};

export const down = false;
