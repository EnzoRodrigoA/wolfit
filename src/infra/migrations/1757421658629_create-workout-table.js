export const up = (pgm) => {
  pgm.createTable("workouts", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    user_id: {
      type: "uuid",
      notNull: true,
    },

    name: {
      type: "varchar(100)",
      notNull: true,
    },

    sequence_index: {
      type: "integer",
      notNull: true,
    },

    is_rest: {
      type: "boolean",
      notNull: true,
      default: false,
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },

    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });

  pgm.createTable("workout_exercise", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    workout_id: {
      type: "uuid",
      notNull: true,
    },

    exercise_id: {
      type: "uuid",
      notNull: true,
    },

    exercise_sequence: {
      type: "integer",
      notNull: true,
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },

    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });
};

export const down = false;
